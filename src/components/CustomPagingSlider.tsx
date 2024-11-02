import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Image } from "@nextui-org/image";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type CustomPagingSliderProps = {
  images: TemplateStringsArray[] | [];
};

export function CustomPagingSlider({ images }: CustomPagingSliderProps) {
  const settings = {
    customPaging: function (i: number) {
      return <Image height={64} width={64} src={`/assets/${images[i]}`} alt={`Slide ${i}`} />;
    },
    dots: true,
    dotsClass: "slick-dots custom-dots",
    infinite: false, // Solo habilita infinite si hay más de una imagen
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const isMobile = useMediaQuery("(max-width: 480px)"); // Tailwind `sm` breakpoint

  return (
    <div className="flex flex-col pb-20">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index}>
            <Image
              className="object-cover rounded-2xl w-full max-h-72 p-2"
              src={`/assets/${image}`}
              alt={`Slide ${index}`}
              width={700}
              height={isMobile ? 200 : 300}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}
