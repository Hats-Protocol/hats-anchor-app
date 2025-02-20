const OrgPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <div>
      <h1>{id}</h1>
    </div>
  );
};

export default OrgPage;
