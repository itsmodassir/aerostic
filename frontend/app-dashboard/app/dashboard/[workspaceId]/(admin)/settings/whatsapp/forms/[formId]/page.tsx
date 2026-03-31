'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { ArrowLeft, Link2, Plus, Rocket, Save, Trash2 } from 'lucide-react';

type QuestionType =
    | 'short_text'
    | 'long_text'
    | 'email'
    | 'phone'
    | 'number'
    | 'single_choice'
    | 'multi_choice';

type FormQuestion = {
    id: string;
    label: string;
    type: QuestionType;
    required: boolean;
    options?: string[];
};

type FormSection = {
    id: string;
    title: string;
    description?: string;
    questions: FormQuestion[];
};

type FormSchema = {
    title: string;
    description?: string;
    sections: FormSection[];
};

type WaForm = {
    id: string;
    name: string;
    description?: string;
    status: 'draft' | 'published' | 'archived';
    metaFlowId?: string | null;
    schemaJson?: Partial<FormSchema>;
};

const QUESTION_TYPES: Array<{ value: QuestionType; label: string }> = [
    { value: 'short_text', label: 'Short text' },
    { value: 'long_text', label: 'Long text' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'single_choice', label: 'Single choice' },
    { value: 'multi_choice', label: 'Multi choice' },
];

function newQuestion(index: number): FormQuestion {
    return {
        id: `q_${Date.now()}_${index}`,
        label: `Question ${index + 1}`,
        type: 'short_text',
        required: false,
        options: [],
    };
}

function normalizeSchema(raw?: Partial<FormSchema>): FormSchema {
    const sections = Array.isArray(raw?.sections) ? raw!.sections : [];
    return {
        title: raw?.title || 'New WA Form',
        description: raw?.description || '',
        sections:
            sections.length > 0
                ? sections.map((s, sectionIndex) => ({
                    id: s?.id || `section_${sectionIndex + 1}`,
                    title: s?.title || `Section ${sectionIndex + 1}`,
                    description: s?.description || '',
                    questions: Array.isArray(s?.questions)
                        ? s.questions.map((q, qIndex) => ({
                            id: q?.id || `q_${sectionIndex + 1}_${qIndex + 1}`,
                            label: q?.label || `Question ${qIndex + 1}`,
                            type: (q?.type as QuestionType) || 'short_text',
                            required: !!q?.required,
                            options: Array.isArray(q?.options) ? q.options : [],
                        }))
                        : [newQuestion(0)],
                }))
                : [
                    {
                        id: 'section_1',
                        title: 'Section 1',
                        description: 'Main details',
                        questions: [newQuestion(0)],
                    },
                ],
    };
}

export default function WhatsappFormEditorPage() {
    const params = useParams();
    const formId = params.formId as string;

    const [form, setForm] = useState<WaForm | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [schema, setSchema] = useState<FormSchema>(normalizeSchema());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadForm = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/wa-forms/${formId}`);
            const data = res.data as WaForm;
            setForm(data);
            setName(data.name || '');
            setDescription(data.description || '');
            setSchema(normalizeSchema(data.schemaJson));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to load form');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadForm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formId]);

    const saveForm = async () => {
        setSaving(true);
        try {
            const payload = {
                name,
                description,
                schemaJson: schema,
            };
            const res = await api.put(`/wa-forms/${formId}`, payload);
            setForm(res.data);
            alert('Form saved');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to save form');
        } finally {
            setSaving(false);
        }
    };

    const publishForm = async () => {
        setSaving(true);
        try {
            await saveForm();
            const res = await api.post(`/wa-forms/${formId}/publish`);
            setForm(res.data);
            alert('Form published to WhatsApp');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Publish failed');
        } finally {
            setSaving(false);
        }
    };

    const addSection = () => {
        setSchema((prev) => ({
            ...prev,
            sections: [
                ...prev.sections,
                {
                    id: `section_${Date.now()}`,
                    title: `Section ${prev.sections.length + 1}`,
                    description: '',
                    questions: [newQuestion(0)],
                },
            ],
        }));
    };

    const updateSection = (sectionId: string, patch: Partial<FormSection>) => {
        setSchema((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === sectionId ? { ...section, ...patch } : section,
            ),
        }));
    };

    const removeSection = (sectionId: string) => {
        setSchema((prev) => ({
            ...prev,
            sections: prev.sections.filter((section) => section.id !== sectionId),
        }));
    };

    const addQuestion = (sectionId: string) => {
        setSchema((prev) => ({
            ...prev,
            sections: prev.sections.map((section) => {
                if (section.id !== sectionId) return section;
                return {
                    ...section,
                    questions: [...section.questions, newQuestion(section.questions.length)],
                };
            }),
        }));
    };

    const updateQuestion = (
        sectionId: string,
        questionId: string,
        patch: Partial<FormQuestion>,
    ) => {
        setSchema((prev) => ({
            ...prev,
            sections: prev.sections.map((section) => {
                if (section.id !== sectionId) return section;
                return {
                    ...section,
                    questions: section.questions.map((question) =>
                        question.id === questionId ? { ...question, ...patch } : question,
                    ),
                };
            }),
        }));
    };

    const removeQuestion = (sectionId: string, questionId: string) => {
        setSchema((prev) => ({
            ...prev,
            sections: prev.sections.map((section) => {
                if (section.id !== sectionId) return section;
                return {
                    ...section,
                    questions: section.questions.filter((question) => question.id !== questionId),
                };
            }),
        }));
    };

    const isPublished = form?.status === 'published';
    const stats = useMemo(() => {
        const questionCount = schema.sections.reduce((acc, section) => acc + section.questions.length, 0);
        return {
            sections: schema.sections.length,
            questions: questionCount,
        };
    }, [schema]);

    if (loading) {
        return <div className="p-6 text-gray-500">Loading form editor...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 animate-in fade-in duration-500">
            <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                    <Link href="/settings/whatsapp/forms" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
                        <ArrowLeft size={16} />
                        Back to WA Forms
                    </Link>
                    <h1 className="mt-2 text-3xl font-black text-gray-900">Form Editor</h1>
                    <p className="text-sm text-gray-500">
                        Sections: {stats.sections} • Questions: {stats.questions}
                        {form?.metaFlowId ? ` • Flow ID: ${form.metaFlowId}` : ''}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/automation/builder?id=new&formId=${encodeURIComponent(formId)}&formName=${encodeURIComponent(name || form?.name || 'WA Form')}&triggerType=flow_response`}
                        className="px-4 py-2 rounded-xl border border-indigo-200 text-indigo-700 font-semibold hover:bg-indigo-50 inline-flex items-center gap-2"
                    >
                        <Link2 size={16} />
                        Attach Trigger Flow
                    </Link>
                    <button
                        onClick={saveForm}
                        disabled={saving}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 inline-flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={16} />
                        Save
                    </button>
                    <button
                        onClick={publishForm}
                        disabled={saving}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-50"
                    >
                        <Rocket size={16} />
                        {isPublished ? 'Republish' : 'Publish'}
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Form Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-2 w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                        <div className="mt-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 capitalize">
                            {form?.status || 'draft'}
                        </div>
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="mt-2 w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Header</label>
                        <input
                            value={schema.title}
                            onChange={(e) => setSchema((prev) => ({ ...prev, title: e.target.value }))}
                            className="mt-2 w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section Description</label>
                        <input
                            value={schema.description || ''}
                            onChange={(e) => setSchema((prev) => ({ ...prev, description: e.target.value }))}
                            className="mt-2 w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {schema.sections.map((section, sectionIndex) => (
                    <div key={section.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    value={section.title}
                                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                    className="px-3 py-2 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-semibold"
                                    placeholder={`Section ${sectionIndex + 1}`}
                                />
                                <input
                                    value={section.description || ''}
                                    onChange={(e) => updateSection(section.id, { description: e.target.value })}
                                    className="px-3 py-2 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                                    placeholder="Section description"
                                />
                            </div>
                            <button
                                onClick={() => removeSection(section.id)}
                                className="p-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                                title="Remove section"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {section.questions.map((question, qIndex) => (
                                <div key={question.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                        <input
                                            value={question.label}
                                            onChange={(e) => updateQuestion(section.id, question.id, { label: e.target.value })}
                                            className="md:col-span-6 px-3 py-2 rounded-lg border border-gray-200 bg-white"
                                            placeholder={`Question ${qIndex + 1}`}
                                        />
                                        <select
                                            value={question.type}
                                            onChange={(e) => updateQuestion(section.id, question.id, { type: e.target.value as QuestionType })}
                                            className="md:col-span-3 px-3 py-2 rounded-lg border border-gray-200 bg-white"
                                        >
                                            {QUESTION_TYPES.map((type) => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                        <label className="md:col-span-2 inline-flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={question.required}
                                                onChange={(e) => updateQuestion(section.id, question.id, { required: e.target.checked })}
                                            />
                                            Required
                                        </label>
                                        <button
                                            onClick={() => removeQuestion(section.id, question.id)}
                                            className="md:col-span-1 p-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    {(question.type === 'single_choice' || question.type === 'multi_choice') && (
                                        <textarea
                                            value={(question.options || []).join('\n')}
                                            onChange={(e) => updateQuestion(section.id, question.id, {
                                                options: e.target.value.split('\n').map((v) => v.trim()).filter(Boolean),
                                            })}
                                            rows={3}
                                            className="mt-3 w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                                            placeholder="One option per line"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => addQuestion(section.id)}
                            className="mt-3 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2 text-sm font-semibold"
                        >
                            <Plus size={14} />
                            Add Question
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addSection}
                className="mt-4 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
            >
                <Plus size={16} />
                Add Section
            </button>
        </div>
    );
}
