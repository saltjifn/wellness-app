import { createBrowserRouter } from "react-router";
import { WeatherScreen } from "@/app/components/WeatherScreen";
import { WellnessScreen } from "@/app/components/WellnessScreen";
import { Root } from "@/app/components/Root";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: WeatherScreen },
      { path: "wellness", Component: WellnessScreen },
    ],
  },
]);
