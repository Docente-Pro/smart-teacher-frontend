import AreaCard from "@/components/Area/AreaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IArea } from "@/interfaces/IArea";
import { IUsuario } from "@/interfaces/IUsuario";
import { getAllAreas } from "@/services/areas.service";
import { getUsuarioByEmail } from "@/services/usuarios.service";
import { userStore } from "@/store/user.store";
import { encrypt } from "@/utils/cryptoUtil";
import { normalizeWord } from "@/utils/normalizeWord";
import { useAuth0 } from "@auth0/auth0-react";

import { useEffect, useState } from "react";

function Areas() {
  const [wordToFilter, setWordToFilter] = useState("");
  const [areas, setAreas] = useState<IArea[]>();
  const [filteredAreas, setFilteredAreas] = useState<IArea[]>();
  const { user } = useAuth0();
  const { setUsuario: setUsuarioFromStore, user : usuarioFromStore } = userStore();

  useEffect(() => {
    getAllAreas().then((response) => {
      setAreas(response.data.data);
      setFilteredAreas(response.data.data);
    });
  }, []);

  useEffect(() => {
    if (user && user.email) {
      getUsuarioByEmail({
        email: encrypt(user.email),
      }).then((response) => {
        setUsuarioFromStore(response.data.data);
      });
    }
  }, [user]);

  useEffect(() => {
    if (areas) {
      setFilteredAreas(filterAreas());
    }
  }, [wordToFilter]);

  function filterAreas() {
    if (areas) {
      return areas.filter((area) => {
        return normalizeWord(area.nombre).toLowerCase().includes(normalizeWord(wordToFilter).toLowerCase());
      });
    }
  }

  console.log(usuarioFromStore)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Crear Sesión</h1>
      <div className="mb-6">
        {/* <h1 className="text-3xl font-bold mb-4">Áreas</h1> */}
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Filtrar por nombre"
            value={wordToFilter}
            onChange={(e) => setWordToFilter(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={() => setWordToFilter("")}>Limpiar</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredAreas && filteredAreas.map((area) => <AreaCard key={area.id} area={area} />)}
      </div>
    </div>
  );
}

export default Areas;
