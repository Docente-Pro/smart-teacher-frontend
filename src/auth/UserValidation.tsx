import { IUsuario } from "@/interfaces/IUsuario";
import { getUsuarioByEmail } from "@/services/usuarios.service";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { encrypt } from "@/utils/cryptoUtil";

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
      const encryptedEmail = encrypt(user.email);

      getUsuarioByEmail({
        email: encryptedEmail,
      })
        .then((response) => {
          setuserFromDB(response.data[0]);
        })
        .catch((error) => {
          // Si el error es 404, redirigir al cuestionario inicial
          if (error.response.status === 404) {
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

  return <div>{children}</div>;
}

export default UserValidation;
