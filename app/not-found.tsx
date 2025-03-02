

export default function NotFound() {
  return (
    <div className="flex mt-16 w-full mx-auto justify-center p-2 max-w-sm flex-col gap-6">
     <h2 className="animate-fade-right text-2xl font-semibold">
       404 - Not Found!
     </h2>
     <p className="animate-fade-up">The page you requested does not exist.</p>
     <p className="mt-10">
       Kindly {' '}
       <a
         className="font-medium underline underline-offset-2"
         href={`/`}
       >
         return back
       </a>{' '}
       to home page.
     </p>
   </div>
  )
}
