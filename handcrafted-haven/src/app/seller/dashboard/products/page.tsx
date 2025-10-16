import ProductsList from "./products-list";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params  = await props.params;

  return (
    <div className="p-5">
      <h1 className="text-lg font-bold my-4">Products On Sale</h1>
      <ProductsList id={params.id} />
    </div>
  );
}
