import { IUsuario } from "@/interfaces/IUsuario";
import { getUsuarioByEmail } from "@/services/usuarios.service";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Header from "@/components/Header";
import CustomizedSidebar from "@/components/CustomizedSidebar";

interface Props {
  children: React.ReactNode;
}

function UserValidation({ children }: Props) {
  const { user } = useAuth0();
  const [_userFromDB, setuserFromDB] = useState<IUsuario>();
  const [loading, setLoading] = useState<boolean>(true);
  const [redirectToQuestionnaire, setRedirectToQuestionnaire] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.email) {
      getUsuarioByEmail({
        email: user.email,
      })
        .then((response) => {
          console.log(response);

          // Verificar la estructura de la respuesta
          const userData = response.data.data || response.data[0] || response.data;
          setuserFromDB(userData);

          // Si el usuario no tiene datos institucionales, redirigir al onboarding
          if (!userData.nombreInstitucion || !userData.nivelId || !userData.gradoId) {
            navigate("/onboarding");
          }
        })
        .catch((error) => {
          // Si el error es 404, redirigir al cuestionario inicial
          if (error.response && error.response.status === 404) {
            setRedirectToQuestionnaire(true);
            navigate(`/cuestionario-inicial`);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (redirectToQuestionnaire) {
    return null; // No renderizar children si se redirige al cuestionario
  }

  return (
    <div>
      <CustomizedSidebar>
        <Header />
        {children}
      </CustomizedSidebar>
    </div>
  );
}

export default UserValidation;
