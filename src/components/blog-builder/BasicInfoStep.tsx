
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BasicInfoStepProps {
  blogName: string;
  setBlogName: (value: string) => void;
  blogTopic: string;
  setBlogTopic: (value: string) => void;
  blogDescription: string;
  setBlogDescription: (value: string) => void;
  domainName: string;
  setDomainName: (value: string) => void;
}

const BasicInfoStep = ({
  blogName,
  setBlogName,
  blogTopic,
  setBlogTopic,
  blogDescription,
  setBlogDescription,
  domainName,
  setDomainName
}: BasicInfoStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="blogName">Blog Name *</Label>
        <Input
          id="blogName"
          placeholder="e.g., Tech Insights, Cooking Adventures"
          value={blogName}
          onChange={(e) => setBlogName(e.target.value)}
          className="mt-2"
        />
      </div>
      
      <div>
        <Label htmlFor="blogTopic">Blog Topic/Niche *</Label>
        <Input
          id="blogTopic"
          placeholder="e.g., Technology, Food, Travel, Business"
          value={blogTopic}
          onChange={(e) => setBlogTopic(e.target.value)}
          className="mt-2"
        />
      </div>
      
      <div>
        <Label htmlFor="blogDescription">Blog Description (Optional)</Label>
        <Textarea
          id="blogDescription"
          placeholder="Brief description of what your blog will be about..."
          value={blogDescription}
          onChange={(e) => setBlogDescription(e.target.value)}
          className="mt-2"
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="domainName">Preferred Domain Name (Optional)</Label>
        <Input
          id="domainName"
          placeholder="e.g., myblog.com"
          value={domainName}
          onChange={(e) => setDomainName(e.target.value)}
          className="mt-2"
        />
      </div>
    </div>
  );
};

export default BasicInfoStep;
