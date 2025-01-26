declare function getAllAreas(): Promise<import("axios").AxiosResponse<any, any>>;
declare function getAreaById(id: number): Promise<import("axios").AxiosResponse<any, any>>;
export { getAllAreas, getAreaById };
