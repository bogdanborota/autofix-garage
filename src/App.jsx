import { useState, useEffect } from "react";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [plate, setPlate] = useState("");
  const [cars, setCars] = useState(() => {
    const saved = localStorage.getItem("autofix_cars");
    return saved ? JSON.parse(saved) : {};
  });
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

  useEffect(() => {
    localStorage.setItem("autofix_cars", JSON.stringify(cars));
  }, [cars]);

  const searchCar = () => setSelectedCar(cars[plate] || null);

  const addCar = () => {
    const updated = { ...cars, [plate]: { info: carInfo, jobs: [] } };
    setCars(updated);
    setSelectedCar(updated[plate]);
  };

  const addJob = () => {
    const updated = {
      ...cars,
      [plate]: { ...cars[plate], jobs: [...cars[plate].jobs, job] },
    };
    setCars(updated);
    setSelectedCar(updated[plate]);
    setJob(emptyJob);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black text-zinc-100 flex items-center justify-center">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6 p-6">

        {/* CLIENT */}
        <div className="bg-zinc-800 rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold mb-4">Auto<span className="text-orange-500">Fix</span> Garage</h1>

          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 p-2 rounded bg-zinc-900 border border-zinc-700"
              placeholder="Număr înmatriculare"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
            />
            <button onClick={searchCar} className="bg-orange-600 px-4 rounded">Caută</button>
          </div>

          {selectedCar && (
            <div>
              <div className="text-sm text-zinc-400 mb-2">
                {selectedCar.info.brand} {selectedCar.info.model} – {selectedCar.info.engine}
              </div>
              <h3 className="font-semibold mb-2">Istoric lucrări</h3>
              <ul className="space-y-2">
                {selectedCar.jobs.map((j, i) => (
                  <li key={i} className="bg-zinc-900 p-3 rounded text-sm space-y-1">
                    <div><strong>{j.date}</strong> – {j.work}</div>

                    {j.work === "Revizie" && (
                      <>
                        <div>Ulei: {j.oilType} {j.oilQty}</div>
                        <div>Filtru ulei: {j.oilFilterChanged ? `Schimbat (${j.oilFilterBrand})` : "Neschimbat"}</div>
                        <div>Filtru combustibil: {j.fuelFilterChanged ? `Schimbat (${j.fuelFilterBrand})` : "Neschimbat"}</div>
                        <div>Filtru aer: {j.airFilterChanged ? `Schimbat (${j.airFilterBrand})` : "Neschimbat"}</div>
                        <div>Filtru habitaclu: {j.cabinFilterChanged ? `Schimbat (${j.cabinFilterBrand})` : "Neschimbat"}</div>
                        <div className="text-orange-400">Următor schimb ulei: {j.nextOil}</div>
                      </>
                    )}

                    {j.work === "Alte lucrări" && (
                      <div>{j.notesInternal}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ADMIN */}
        <div className="bg-zinc-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Panou Admin</h2>
          <button onClick={() => setIsAdmin(!isAdmin)} className="mb-4 bg-zinc-700 px-4 py-2 rounded">
            {isAdmin ? "Logout" : "Login Admin"}
          </button>

          {isAdmin && (
            <div className="space-y-2">
              {!selectedCar && plate && (
                <>
                  <input className="w-full p-2 rounded bg-zinc-900" placeholder="Marcă" onChange={(e) => setCarInfo({ ...carInfo, brand: e.target.value })} />
                  <input className="w-full p-2 rounded bg-zinc-900" placeholder="Model" onChange={(e) => setCarInfo({ ...carInfo, model: e.target.value })} />
                  <input className="w-full p-2 rounded bg-zinc-900" placeholder="Motorizare" onChange={(e) => setCarInfo({ ...carInfo, engine: e.target.value })} />
                  <input className="w-full p-2 rounded bg-zinc-900" placeholder="VIN (doar admin)" onChange={(e) => setCarInfo({ ...carInfo, vin: e.target.value })} />
                  <button onClick={addCar} className="bg-green-600 py-2 rounded">Adaugă mașina</button>
                </>
              )}

              {selectedCar && (
                <>
                  <input type="date" className="w-full p-2 rounded bg-zinc-900" value={job.date} onChange={(e) => setJob({ ...job, date: e.target.value })} />

                  <select className="w-full p-2 rounded bg-zinc-900" value={job.work} onChange={(e) => setJob({ ...job, work: e.target.value })}>
                    <option value="">Selectează tip lucrare</option>
                    <option value="Revizie">Revizie</option>
                    <option value="Alte lucrări">Alte lucrări</option>
                  </select>

                  {job.work === "Revizie" && (
                    <>
                      <input className="w-full p-2 rounded bg-zinc-900" placeholder="Tip ulei" value={job.oilType} onChange={(e) => setJob({ ...job, oilType: e.target.value })} />
                      <input className="w-full p-2 rounded bg-zinc-900" placeholder="Cantitate ulei" value={job.oilQty} onChange={(e) => setJob({ ...job, oilQty: e.target.value })} />

                      <label><input type="checkbox" checked={job.oilFilterChanged} onChange={(e) => setJob({ ...job, oilFilterChanged: e.target.checked })} /> Filtru ulei</label>
                      <input className="w-full p-2 rounded bg-zinc-900" placeholder="Marcă filtru ulei" value={job.oilFilterBrand} onChange={(e) => setJob({ ...job, oilFilterBrand: e.target.value })} />

                      <label><input type="checkbox" checked={job.fuelFilterChanged} onChange={(e) => setJob({ ...job, fuelFilterChanged: e.target.checked })} /> Filtru combustibil</label>
                      <input className="w-full p-2 rounded bg-zinc-900" placeholder="Marcă filtru combustibil" value={job.fuelFilterBrand} onChange={(e) => setJob({ ...job, fuelFilterBrand: e.target.value })} />

                      <label><input type="checkbox" checked={job.airFilterChanged} onChange={(e) => setJob({ ...job, airFilterChanged: e.target.checked })} /> Filtru aer</label>
                      <input className="w-full p-2 rounded bg-zinc-900" placeholder="Marcă filtru aer" value={job.airFilterBrand} onChange={(e) => setJob({ ...job, airFilterBrand: e.target.value })} />

                      <label><input type="checkbox" checked={job.cabinFilterChanged} onChange={(e) => setJob({ ...job, cabinFilterChanged: e.target.checked })} /> Filtru habitaclu</label>
                      <input className="w-full p-2 rounded bg-zinc-900" placeholder="Marcă filtru habitaclu" value={job.cabinFilterBrand} onChange={(e) => setJob({ ...job, cabinFilterBrand: e.target.value })} />

                      <input className="w-full p-2 rounded bg-zinc-900" placeholder="Următor schimb ulei" value={job.nextOil} onChange={(e) => setJob({ ...job, nextOil: e.target.value })} />
                    </>
                  )}

                  {job.work === "Alte lucrări" && (
                    <textarea className="w-full p-2 rounded bg-zinc-900" placeholder="Descriere lucrare efectuată" value={job.notesInternal} onChange={(e) => setJob({ ...job, notesInternal: e.target.value })} />
                  )}

                  <button onClick={addJob} className="bg-blue-600 py-2 rounded">Salvează lucrare</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
