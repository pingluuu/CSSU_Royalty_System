import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

export default function EventsListingPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initPage = parseInt(searchParams.get("page") || "1", 10);
  const initName = searchParams.get("name") || "";
  const initLocation = searchParams.get("location") || "";
  const initStarted = searchParams.get("started") || "";
  const initEnded = searchParams.get("ended") || "";
  const initShowFull = searchParams.get("showFull") || "false";
  const initPublished = searchParams.get("published") || "true";
  const initLimit = parseInt(searchParams.get("limit") || "10", 10);
  const link_location = useLocation();

  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState<number>(initPage);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(initLimit);


  const [name, setName] = useState<string>(initName);
  const [location, setLocation] = useState<string>(initLocation);
  const [started, setStarted] = useState<string>(initStarted);
  const [ended, setEnded] = useState<string>(initEnded);
  const [showFull, setShowFull] = useState<string>(initShowFull);
  const [published, setPublished] = useState<string>(initPublished);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [morePermissionRole, setMorePermissionRole] = useState(false);

  const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

  const applyFilters = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (started && ended) {
      setError("Cannot filter by both 'started' and 'ended'. Please choose one.");
      return;
    }
    setError(null);
    if (page !== 1) {
      setPage(1);
    } else {
      setFetchTrigger((prev) => prev + 1);
    }
  };

  const updateURL = () => {
    const params: any = { page: page.toString(), limit: limit.toString()};
    if (name) params.name = name;
    if (location) params.location = location;
    if (started) params.started = started;
    if (ended) params.ended = ended;
    if (showFull) params.showFull = showFull;
    if (published) params.published = published;
    setSearchParams(params);
  };

  interface Organizer {
    utorid: string;
  }

  interface Event {
    id: number;
    name: string;
    location: string;
    startTime: string;
    endTime: string;
    capacity?: number;
    numGuests: number;
    organizers?: Organizer[];
  }

  const eventNavLink = (ev: Event): string => {
    const isOrganizer: boolean = !!ev.organizers && !!user && ev.organizers.some((org: Organizer) => org.utorid === user.utorid);
    if (isOrganizer || (user && ["manager", "superuser"].includes(user.role))) {
      return `/manager/events/${ev.id}`;
    }
    return `/events/${ev.id}`;
  };

  useEffect(() => {
    const role = !!user && ["manager", "superuser"].includes(user.role);
    setMorePermissionRole(role);
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      const payload: any = { page, limit };
      if (name.trim()) payload.name = name.trim();
      if (location.trim()) payload.location = location.trim();
      if (started) payload.started = started === "true";
      if (ended) payload.ended = ended === "true";
      if (showFull) payload.showFull = showFull === "true";
      if (published) payload.published = published === "true";

      try {
        const res = await api.get("/events", { params: payload });
        setTotalCount(res.data.count);
        setEvents(res.data.results);
      } catch (err) {
        console.error("Error fetching events", err);
        setError("Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    updateURL();
    fetchEvents();
  }, [page, fetchTrigger]);

  return (
    <div className="container mt-4" style={{ maxWidth: '750px' }}>
      <h2>All Events</h2>
      <form className="mb-4">
        <div className="row">
          <div className="col-md-3">
            <label className="form-label">Event Name:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter event name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Location:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Show Full</label>
            <select
              className="form-select"
              value={showFull}
              onChange={(e) => setShowFull(e.target.value)}
            >
              <option value="false">Hide Full Events</option>
              <option value="true">Show Full Events</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Published</label>
            <select
              className="form-select"
              value={published}
              onChange={(e) => setPublished(e.target.value)}
              disabled={!morePermissionRole}
            >
              <option value="false">False</option>
              <option value="true">True</option>
            </select>
          </div>

          <div className="col-md-8">
            <label className="form-label">Filter by Status:</label>
            <div className="d-flex">
              <select
                className="form-select me-2"
                value={started}
                onChange={(e) => {
                  setStarted(e.target.value);
                  if (e.target.value) setEnded("");
                }}
              >
                <option value="">--Select Started Filter--</option>
                <option value="true">Started</option>
                <option value="false">Not Started</option>
              </select>
              <select
                className="form-select"
                value={ended}
                onChange={(e) => {
                  setEnded(e.target.value);
                  if (e.target.value) setStarted("");
                }}
              >
                <option value="">--Select Ended Filter--</option>
                <option value="true">Ended</option>
                <option value="false">Not Ended</option>
              </select>
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label me-2">Results per page:</label>
            <div className="d-flex">
              <select
                className="form-select"
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value, 10));
                }}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          <div className="col-md-4 d-flex align-items-end mt-2">
            <button
              type="submit"
              onClick={applyFilters}
              className="btn btn-primary w-100"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </form>

      <div>
        {loading ? (
          <p className="text-center">Loading events...</p>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : events.length === 0 ? (
          <p className="text-center">No events found.</p>
        ) : (
          <>
            {events.map((ev) => (
              <Link
                key={ev.id}
                className="transaction-card transaction-event"
                to={eventNavLink(ev)}
                style={{ textDecoration: 'none', color: 'inherit' }}
                state={{ from: link_location }}
              >
                <h5>Events# {ev.id}</h5>
                <p>
                  <strong>Name:</strong> {ev.name}<br />
                  <strong>Location:</strong> {ev.location}<br />
                  <strong>Start Time:</strong> {ev.startTime}<br />
                  <strong>End Time:</strong> {ev.endTime}<br />
                  <strong>Capacity:</strong> {ev.capacity ? ev.capacity : "Unlimited"}<br />
                  <strong>Num Guests</strong> {ev.numGuests}<br />
                </p>
              </Link>
            ))}
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1 || loading}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages || loading}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}