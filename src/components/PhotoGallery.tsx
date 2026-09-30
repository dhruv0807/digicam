import friends from "@/assets/photo-friends.jpg";
import holiday from "@/assets/photo-holiday.jpg";
import school from "@/assets/photo-school.jpg";
import roadtrip from "@/assets/photo-roadtrip.jpg";
import birthday from "@/assets/photo-birthday.jpg";
import city from "@/assets/photo-city.jpg";

const PHOTOS = [
  { src: friends, category: "Friends", file: "IMG_0382.JPG", date: "04/16/2005", mp: "5.1 MP" },
  { src: holiday, category: "Holidays", file: "IMG_0741.JPG", date: "07/16/2006", mp: "6.0 MP" },
  { src: school, category: "School", file: "IMG_0118.JPG", date: "10/26/2004", mp: "4.0 MP" },
  { src: birthday, category: "Parties", file: "IMG_1204.JPG", date: "02/09/2005", mp: "5.1 MP" },
  { src: roadtrip, category: "Road Trips", file: "IMG_2276.JPG", date: "08/03/2007", mp: "7.2 MP" },
  { src: city, category: "Random Tuesday", file: "IMG_3051.JPG", date: "11/18/2008", mp: "10 MP" },
];

export function PhotoGallery() {
  return (
    <div className="w-full">
      <div
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6 md:px-16"
        data-no-drag
        style={{ scrollbarWidth: "thin" }}
      >
        {PHOTOS.map((p) => (
          <figure key={p.file} className="w-[78vw] shrink-0 snap-center sm:w-[46vw] lg:w-[30vw]">
            <div className="panel-world overflow-hidden rounded-sm p-3">
              <img
                src={p.src}
                alt={`Early digital camera snapshot — ${p.category}`}
                loading="lazy"
                width={944}
                height={704}
                className="photo-ccd aspect-[4/3] w-full object-cover"
              />
              <figcaption className="text-world-dim mt-3 flex items-center justify-between font-tech text-[0.6rem] tracking-[0.2em] uppercase">
                <span>{p.file}</span>
                <span>{p.date}</span>
                <span>{p.mp}</span>
              </figcaption>
            </div>
            <p className="text-world mt-3 font-tech text-[0.65rem] tracking-[0.3em] uppercase">{p.category}</p>
          </figure>
        ))}
      </div>
    </div>
  );
}
