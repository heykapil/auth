export default async function ErrorPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const { error } = await searchParams;
  return (
    <div className="flex mt-16 w-full mx-auto justify-center p-2 flex-col space-y-1">
      <h3 className="animate-fade-right">API Error occured!</h3>
      <p className="animate-fade-up text-lg">
        Possible cause:{" "}
        <span className="text-base italic">
          {error ? decodeURIComponent(error) : "Unknown Error"}
        </span>
      </p>
      <p className="text-base">
        Kindly return back to homepage or contact me at{" "}
        <i> hello [at] kapil [dot] app</i>.
      </p>
    </div>
  );
}
