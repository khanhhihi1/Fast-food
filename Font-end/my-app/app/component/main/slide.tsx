"use client";
import Carousel from "react-bootstrap/Carousel";
import SlideImage from "./slideImage";
export default function Slide() {
  return (
    <Carousel>
      <Carousel.Item>
        <SlideImage text="First slide" />
      </Carousel.Item>
      <Carousel.Item>
        <video
          src="/video fried chicken.mp4"
          autoPlay
          loop
          muted
          style={{ width: "100%", height: "auto", objectFit: "cover" }}
        />
      </Carousel.Item>
    </Carousel>
  );
}
