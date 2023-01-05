import {
  updateFilterOrganization,
  useOrganizationController,
} from "../../../../context/organizationContext";
import { useEffect } from "react";

export default function FilterFormOrganization(pageSize: number, search: string) {
  // @ts-ignore
  const [organizationController, organizationDispatch] = useOrganizationController();
  useEffect(() => {
    if (organizationController?.organizations > 0) {
      const filter = {
        pageSize,
        search,
      };
      updateFilterOrganization(organizationDispatch, filter);
    }
  }, [organizationController]);

  return <> </>;
}
