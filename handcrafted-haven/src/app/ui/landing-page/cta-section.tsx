import Image from "next/image";

export default function CallToAtion(){
    return(
        <div
        className="flex flex-col items-center  justify-center relative h-100"
      >
        <Image
          src={"/artisans/cta-picture.jpg"}
          alt="artisan's picture"
          fill={true}
          className="relative object-cover"
        />
        <div className="absolute inset-0 h-full z-50 flex flex-col items-center justify-evenly gap-2 p-2 w-full bg-black/50 text-white ">
          <h3 className="text-xl font-bold text-center">
            Handmade with <span className="text-red-500">love</span>, delivered
            with <span className="text-red-500">care</span>. Make it{" "}
            <span className="text-red-500">yours</span>.
          </h3>
          <button
            type="button"
            className="bg-white text-black py-2 px-4 rounded-md cursor-pointer"
          >
            Explore now
          </button>
        </div>
      </div>
    )
}