import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject, IsBoolean } from 'class-validator';

export class CreateWorkflowDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    nodes: any[];

    @IsArray()
    edges: any[];

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateWorkflowDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    nodes?: any[];

    @IsArray()
    @IsOptional()
    edges?: any[];

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
