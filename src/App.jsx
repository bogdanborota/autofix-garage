import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// 🔐 Supabase config (public)
const supabaseUrl = "https://sviegqtscpebvwilesyk.supabase.co";
const supabaseAnonKey = "sb_publishable_C365d01DOHWyUIg8pFPYjg_QTMjqufp";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [plate, setPlate] = useState("");
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);

  const emptyJob = {
    date: "",
    work: "",
    oilType: "",
    oilQty: "",
    oilFilterChanged: false,
    oilFilterBrand: "",
    fuelFilterChanged: false,
    fuelFilterBrand: "",
    airFilterChanged: false,
    airFilterBrand: "",
    cabinFilterChanged: false,
    cabinFilterBrand: "",
    nextOil: "",
    notesInternal: "",
  };

  const [carInfo, setCarInfo] = useState({ brand: "", model: "", engine: "", vin: "" });
  const [job, setJob] = useState(emptyJob);

  // 🔄 Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsAdmin(!!data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAdmin(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // 📥 Load cars + jobs (public read)
  const searchCar = async () => {
    setSelectedCar(null);

    const { data: car } = await supabase
      .from("cars")
      .select("*, jobs(*)")
      .eq("plate", plate)
      .single();

    if (car) setSelectedCar(car);
  };

  // ➕ Add car (admin)
  const addCar = async () => {
    const { data } = await supabase
      .from("cars")
      .insert([{ plate, ...carInfo }])
      .select()
      .single();

    if (data) setSelectedCar({ ...data, jobs: [] });
  };

  // ➕ Add job (admin)
  const addJob = async () => {
    await supabase.from("jobs").insert([
      {
        car_id: selectedCar.id,
        date: job.date,
        work_type: job.work,
        oil_type: job.oilType,
        oil_qty: job.oilQty,

        oil_filter_changed: job.oilFilterChanged,
        oil_filter_brand: job.oilFilterBrand,
        fuel_filter_changed: job.fuelFilterChanged,
        fuel_filter_brand: job.fuelFilterBrand,
        air_filter_changed: job.airFilterChanged,
        air_filter_brand: job.airFilterBrand,
        cabin_filter_changed: job.cabinFilterChanged,
        cabin_filter_brand: job.cabinFilterBrand,

        next_oil: job.nextOil,
        description: job.notesInternal,
      },
    ]);

    searchCar();
    setJob(emptyJob);
  };

  // 🔐 Login admin (username = admin)
    const [adminPassword, setAdminPassword] = useState("");

  const loginAdmin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: "admin@autofix.local",
      password: adminPassword,
    });

    if (error) {
      alert("Parolă greșită sau problemă de autentificare");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSelectedCar(null);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex justify-center p-6">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-6">

        {/* CLIENT */}
        <div className="bg-zinc-800 rounded-xl p-6">
          <h1 className="text-2xl font-bold mb-4">Auto<span className="text-orange-500">Fix</span> Garage</h1>

          <div className="flex gap-2 mb-4">
            <input className="flex-1 p-2 rounded text-black" placeholder="Număr înmatriculare" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} />
            <button className="bg-orange-600 px-4 rounded" onClick={searchCar}>Caută</button>
          </div>

          {selectedCar && (
            <div>
              <p className="text-sm text-zinc-400 mb-2">{selectedCar.brand} {selectedCar.model} – {selectedCar.engine}</p>
              <h3 className="font-semibold mb-2">Istoric lucrări</h3>
              <ul className="space-y-2">
                {selectedCar.jobs?.map((j, i) => (
                  <li key={i} className="bg-zinc-900 p-3 rounded text-sm">
                    <div><strong>{j.date}</strong> – {j.work_type}</div>
                    {j.work_type === "Revizie" && (
                      <>
                        <div>Ulei: {j.oil_type} {j.oil_qty}</div>
                        <div>Filtru ulei: {j.oil_filter_changed ? `Schimbat (${j.oil_filter_brand})` : "Neschimbat"}</div>
                        <div>Filtru combustibil: {j.fuel_filter_changed ? `Schimbat (${j.fuel_filter_brand})` : "Neschimbat"}</div>
                        <div>Filtru aer: {j.air_filter_changed ? `Schimbat (${j.air_filter_brand})` : "Neschimbat"}</div>
                        <div>Filtru habitaclu: {j.cabin_filter_changed ? `Schimbat (${j.cabin_filter_brand})` : "Neschimbat"}</div>
                        <div className="text-orange-400">Următor schimb ulei: {j.next_oil}</div>
                      </>
                    )}
                    {j.work_type === "Alte lucrări" && <div>{j.description}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ADMIN */}
        <div className="bg-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Admin</h2>

          {!isAdmin && (
            <div className="space-y-2">
              <input
                type="password"
                className="w-full p-2 rounded text-black"
                placeholder="Parolă admin"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              <button className="bg-zinc-700 px-4 py-2 rounded w-full" onClick={loginAdmin}>
                Autentificare
              </button>
            </div>
          )}

          {isAdmin && (
            <button className="bg-red-600 px-4 py-2 rounded mb-4" onClick={logout}>Logout</button>
          )}

          {isAdmin && !selectedCar && plate && (
            <button className="bg-green-600 py-2 rounded" onClick={addCar}>Adaugă mașina</button>
          )}
        </div>
      </div>
    </div>
  );
}

