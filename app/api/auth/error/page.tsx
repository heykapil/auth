export default async function ErrorPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const { error, error_description } = await searchParams;
  return (
    <div className="flex mt-16 w-full mx-auto justify-center p-2 flex-col space-y-1">
      <h3 className="animate-fade-right capitalize">
        {error ? decodeURIComponent(error) : "Unknown API Error"}!
      </h3>
      <p className="animate-fade-up text-lg">
        <span className="text-base italic">
          {error_description
            ? decodeURIComponent(error_description)
            : "Unknown Error"}
        </span>
      </p>
      <p className="text-base">
        Kindly return back to homepage or contact me at{" "}
        <i> hello [at] kapil [dot] app</i>.
      </p>
    </div>
  );
}
