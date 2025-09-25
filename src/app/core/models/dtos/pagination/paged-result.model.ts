import { PagedQuery } from "./paged-query.model";

export interface PagedResult<T> {
    pagedQuery: PagedQuery;
    items: T[];
    totalCount: number;
    totalPages: number;
}
