const OrganizationIdPage = ({
  params,
}: {
  params: { organizationId: string };
}) => {
  return <div>Organization Id: {params.organizationId}</div>;
};

export default OrganizationIdPage;
