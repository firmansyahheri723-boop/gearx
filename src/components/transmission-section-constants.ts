import type { HelpLink } from '../types';

export const HELP_CONTENT: Record<
  string,
  { description: string; articles?: HelpLink[]; videos?: HelpLink[] }
> = {
  transmission: {
    description:
      "Configure your vehicle's transmission characteristics including the engine's torque curve and individual gear ratios. This data is used to calculate acceleration, optimal shift points, and wheel torque output.",
    articles: [
      {
        label: "Wikipedia: Transmission",
        url: "https://en.wikipedia.org/wiki/Transmission_(mechanics)",
      },
    ],
    videos: [
      {
        label: "Engine & Transmission Swap Guide",
        url: "https://youtu.be/iP2bXvSc0WU?si=Tcy02GPdHieKN8gz",
      },
      {
        label: "Transmission Talk",
        url: "https://youtu.be/oGohWF7HZrw?si=yFHI1mTFhoMXlQ2M",
      },
    ],
  },
  torqueCurve: {
    description:
      "Engine torque output at various RPM points. This data defines the engine's power characteristics and is used to calculate acceleration, optimal shift points, and gear ratios. Higher torque at lower RPM provides better drivability, while peak torque at higher RPM favors top-end power.",
    articles: [
      {
        label: "Wikipedia: Torque Curve",
        url: "https://en.wikipedia.org/wiki/Torque_curve",
      },
      {
        label: "Wikipedia: Engine Power",
        url: "https://en.wikipedia.org/wiki/Power_(physics)",
      },
    ],
    videos: [
      {
        label: "Engine & Transmission Swap Guide",
        url: "https://youtu.be/iP2bXvSc0WU?si=Tcy02GPdHieKN8gz",
      },
      {
        label: "Engine Talk",
        url: "https://youtu.be/A6SZfn6Kgfg?si=J3IxTU4NBJ42-M10",
      },
    ],
  },
  gearRatios: {
    description:
      "Individual gear multipliers that determine the mechanical advantage at each gear. Lower gears have higher ratios for acceleration, while higher gears have lower ratios for speed and fuel efficiency. Adjust the slider within the min/max range, or click the min/max values to expand the range.",
    articles: [
      {
        label: "Wikipedia: Gear Ratio",
        url: "https://en.wikipedia.org/wiki/Gear_ratio",
      },
      {
        label: "Wikipedia: Transmission",
        url: "https://en.wikipedia.org/wiki/Transmission_(mechanics)",
      },
    ],
    videos: [
      {
        label: "Gear Ratios Guide",
        url: "https://youtu.be/8_SaobHPhWs?si=_5gsrOEVdybXMOXN",
      },
      {
        label: "Transmission Talk",
        url: "https://youtu.be/oGohWF7HZrw?si=yFHI1mTFhoMXlQ2M",
      },
    ],
  },
  gearGap: {
    description:
      "The difference between the previous gear ratio and current gear ratio. Gaps naturally decrease for higher gears due to logarithmic gear spacing, helping maintain the engine in its powerband across shifts.",
  },
};
