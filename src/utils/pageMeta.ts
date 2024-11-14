
export interface PageOptions {
  page: number;
  limit: number;
}

export class PageMeta {
  readonly page: number;
  readonly limit: number;
  readonly itemCount: number;
  readonly pageCount: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;

  constructor(pageOptions: PageOptions, itemCount: number) {
    this.page = pageOptions?.page;
    this.limit = pageOptions?.limit;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.limit);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
