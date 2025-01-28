import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Dispatch, SetStateAction } from "react";
import { IUsuarioToSave } from "@/interfaces/IUsuario";

interface Props {
  array: any[];
  setValuesOfUser: Dispatch<SetStateAction<IUsuarioToSave>>;
  placeholder: string;
  valueToSet: keyof IUsuarioToSave;
  label: string;
  state: IUsuarioToSave;
}

function CustomSelectCI({ array, setValuesOfUser, placeholder, valueToSet, label, state }: Props) {
  function handleChange(value: string) {
    setValuesOfUser((prevState) => ({ ...prevState, [valueToSet]: Number(value) }));
  }

  function renderChildren() {
    return (
      <>
        <SelectTrigger className="w-full dark:bg-white dark:text-black">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {array?.map((item) => (
              <SelectItem className="cursor-pointer  dark:text-white" key={item.id} value={item.id.toString()}>
                <SelectLabel>{item.nombre}</SelectLabel>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </>
    );
  }

  return (
    <section className="w-full flex flex-col gap-2 mt-4">
      <Label htmlFor="educacion">{label}</Label>
      {state[`${valueToSet}`] ? (
        <Select onValueChange={(value) => handleChange(value)}>{renderChildren()}</Select>
      ) : (
        <Select onValueChange={(value) => handleChange(value)}>{renderChildren()}</Select>
      )}
    </section>
  );
}

export default CustomSelectCI;
