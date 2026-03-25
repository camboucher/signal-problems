export interface MtaFeed {
  id: string;
  url: string;
  lines: string[];
}

// MTA GTFS-RT feed endpoints (free, no API key required as of 2024)
// See https://api.mta.info for latest info
export const MTA_FEEDS: MtaFeed[] = [
  {
    id: "gtfs",
    url: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs",
    lines: ["1", "2", "3", "4", "5", "6", "7", "GS"],
  },
  {
    id: "gtfs-ace",
    url: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace",
    lines: ["A", "C", "E", "FS", "H"],
  },
  {
    id: "gtfs-bdfm",
    url: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm",
    lines: ["B", "D", "F", "M"],
  },
  {
    id: "gtfs-g",
    url: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g",
    lines: ["G"],
  },
  {
    id: "gtfs-jz",
    url: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz",
    lines: ["J", "Z"],
  },
  {
    id: "gtfs-l",
    url: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l",
    lines: ["L"],
  },
  {
    id: "gtfs-nqrw",
    url: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw",
    lines: ["N", "Q", "R", "W"],
  },
  {
    id: "gtfs-si",
    url: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si",
    lines: ["SI"],
  },
];
