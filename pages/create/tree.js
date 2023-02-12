import { useForm } from "react-hook-form";

export default function CreateTree() {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => console.log(data);

  return (
    <div className="bg-slate-50 flex-grow ">
      <div className="max-w-screen-xl m-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 rounded-md shadow-md bg-white"
        >
          <div className="space-y-6 mx-4 flex flex-col">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mt-4">
                Tree Details
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                This information will be displayed publicly so be careful what
                you share.
              </p>
            </div>

            <div className="">
              <label
                htmlFor="tree-name"
                className="block text-sm font-medium text-gray-700"
              >
                Top-Hat Address
              </label>
              <input
                type="text"
                name="tree-name"
                id="tree-name"
                className="block w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm mt-2"
                placeholder="0x123..."
                {...register("topHatAddress")}
              />
              <p className="mt-2 text-sm text-gray-500">
                Address of the top most admin, aka the top-hat.
              </p>
            </div>

            <div className="">
              <label
                htmlFor="details"
                className="block text-sm font-medium text-gray-700"
              >
                Details
              </label>
              <div className="mt-1">
                <textarea
                  id="details"
                  name="details"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Tree description"
                  {...register("details")}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Brief description of the tree.
              </p>
            </div>

            <div className="">
              <label
                htmlFor="image-uri"
                className="block text-sm font-medium text-gray-700"
              >
                Image URI
              </label>
              <input
                type="text"
                name="image-uri"
                id="image-uri"
                className="block w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm mt-2"
                placeholder="https://ipfs.io/ipfs/..."
                {...register("imageURI")}
              />
              <p className="mt-2 text-sm text-gray-500">
                What image do you want to represent this tree? This will be the
                image that appears alongside the top-hat token in the Hats dapp,
                other apps integrating with Hats Protocol, and anywhere the hat
                NFTs are viewable.
              </p>
            </div>
            <div>
              <button
                type="submit"
                className="mb-2 rounded-md border border-transparent bg-indigo-600 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <div className="m-2">Create</div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
