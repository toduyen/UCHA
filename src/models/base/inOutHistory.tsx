import { Camera, convertResponseToCamera } from "./camera";
import { convertResponseToEmployee, Employee } from "./employee";
import { convertResponseToMetadata, Metadata } from "./metadata";

export interface InOutHistory {
  id: number;
  type: string;
  areaRestrictionName: string;
  image: Metadata | null;
  time: string;
  camera: Camera;
  employee: Employee;
  status: string;
}

export const convertResponseToInOutHistory = (response: any) => ({
  id: response.id,
  type: response.type,
  areaRestrictionName: response.area_restriction_name,
  image: response.image ? convertResponseToMetadata(response.image) : null,
  time: response.time,
  camera: convertResponseToCamera(response.camera),
  employee: convertResponseToEmployee(response.employee),
  status: response.status,
});
