import { IsNumber, IsOptional, Min, Max } from "class-validator";

export class CursorPaginationDto {
    @IsNumber()
    @IsOptional()
    id: number;
}

export class PaginationDto {
    @IsNumber()
    @IsOptional()
    @Min(0)
    skip: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(100)
    take: number = 50;

    @IsOptional()
    cursor: CursorPaginationDto;
}