import { useState } from "react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Select, SelectItem } from "@nextui-org/react"; // o "@nextui-org/select" según tu versión
import useFormulario from "@/hooks/useFormulario";
import { Formulario } from "@/types";
import { CREAR_FORMULARIO, OBTENER_FORMULARIOS } from "@/graphql/formulario";
import { useMutation } from "@apollo/client";

// Definimos tipos para tu estado local
type FieldType = 'boolean' | 'number' | 'texto' | 'firma' | 'check' | 'opcion' | 'selector' | 'fecha' | 'hora';

type Field = {
  id: number;
  name: string;
  fieldType: FieldType;
  booleanOptions?: {
    trueLabel: string;
    falseLabel: string;
  };
  selectorOptions?: {
    source: string;
    parameter: string;
  };
};

type Category = {
  id: number;
  name: string;
  fields: Field[];
};

export default function Formularios() {
  // Estado para el nombre y descripción del formulario
  const { state } = useFormulario()
  const [Nombre, setFormName] = useState("");
  const [Descripcion, setFormDescription] = useState("");

  // Categorías y sus campos
  const [categorias, setCategories] = useState<Category[]>([]);
  const [crearFormulario] = useMutation(CREAR_FORMULARIO, {
    refetchQueries: [{ query: OBTENER_FORMULARIOS }],
  });

  // ==================== Manejo de Categorías ====================
  const vehiculoParams = ["placa", "marca", "linea", "modelo", "color", "claseVehiculo", "tipoCarroceria",
    "combustible", "numeroMotor", "vin", "numeroSerie", "numeroChasis", "propietarioNombre",
    "propietarioIdentificacion", "kilometraje", "estado", "latitud", "longitud", "soatVencimiento",
    "tecnomecanicaVencimiento", "tarjetaDeOperacionVencimiento", "polizaContractualVencimiento",
    "polizaExtraContractualVencimiento", "polizaTodoRiesgoVencimiento", "fechaMatricula"
  ];

  const handleAddCategory = () => {
    const newCategory: Category = {
      id: Date.now(),
      name: "",
      fields: [],
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleCategoryNameChange = (categoryId: number, newName: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, name: newName } : cat
      )
    );
  };

  // ==================== Manejo de Campos ====================

  const handleAddField = (categoryId: number) => {
    const newField: Field = {
      id: Date.now(),
      name: "",
      fieldType: "texto", // valor por defecto
    };
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            fields: [...cat.fields, newField],
          };
        }
        return cat;
      })
    );
  };

  const handleFieldNameChange = (categoryId: number, fieldId: number, newName: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            fields: cat.fields.map((f) =>
              f.id === fieldId ? { ...f, name: newName } : f
            ),
          };
        }
        return cat;
      })
    );
  };

  // Actualizar el tipo de campo (boolean, number, etc.)
  const handleFieldTypeChange = (categoryId: number, fieldId: number, newType: FieldType) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            fields: cat.fields.map((f) =>
              f.id === fieldId ? { ...f, fieldType: newType } : f
            ),
          };
        }
        return cat;
      })
    );
  };

  const handleFieldChange = (
    categoryId: number,
    fieldId: number,
    key: keyof Field,
    value: any
  ) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
            ...cat,
            fields: cat.fields.map((field) =>
              field.id === fieldId ? { ...field, [key]: value } : field
            ),
          }
          : cat
      )
    );
  };

  // Eliminar un campo específico
  const handleRemoveField = (categoryId: number, fieldId: number) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            fields: cat.fields.filter((f) => f.id !== fieldId),
          };
        }
        return cat;
      })
    );
  };

  // ==================== Envío final del formulario ====================
  const handleSubmitForm = async () => {
    try {
      await crearFormulario({
        variables: {
          input: {
            Nombre,
            Descripcion,
            Categorias: categorias.map(cat => ({
              Nombre: cat.name,
              Descripcion: "",
              Campos: cat.fields.map(field => ({
                Nombre: field.name,
                Tipo: field.fieldType,
                Requerido: false,
                Placeholder: "",
                ValorDefecto: "",
                Fuente: field.selectorOptions?.source || "",
                Parametro: field.selectorOptions?.parameter || "",
                OpcionTrue: field.booleanOptions?.trueLabel || "",
                OpcionFalse: field.booleanOptions?.falseLabel || "",
                ReferenciaCampo: "",
                ReferenciaPropiedad: "",
                Descripcion: "",
              })),
            }))
          }
        }
      });
      alert("Formulario creado exitosamente");
    } catch (error) {
      console.error("Error al crear formulario:", error);
      alert("No se pudo crear el formulario");
    }
  };

  return (
    <div className="space-y-10 px-10">
      <h1 className="flex-1 text-green-700 font-black text-2xl lg:text-4xl text-center">
        Gestión de formularios
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div className="space-y-3">
          <h2 className="text-green-700 font-bold text-2xl">Creación de formulario</h2>

          <form
            className="space-y-10"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitForm();
            }}
          >
            <div className="space-y-3">
              <Input
                label="Nombre"
                placeholder="Nombre del formulario"
                type="text"
                variant="faded"
                value={Nombre}
                isRequired
                onValueChange={(val) => setFormName(val)}
              />
              <Input
                label="Descripción"
                placeholder="Descripción del formulario"
                type="text"
                variant="faded"
                value={Descripcion}
                isRequired
                onValueChange={(val) => setFormDescription(val)}
              />
            </div>

            {/* Botón para añadir categorías */}
            <div className="flex justify-center mt-10">
              <Button
                type="button"
                className="text-white bg-blue-500"
                onPress={handleAddCategory}
                fullWidth
              >
                + Añadir categoria
              </Button>
            </div>

            {/* Listado de categorías y sus campos */}
            {categorias.map((cat) => (
              <div key={cat.id} className="flex flex-col mt-4 p-3 border border-green-400 space-y-3 rounded-md">
                <Input
                  label="Nombre de la categoría"
                  placeholder="Ej. Datos personales"
                  value={cat.name}
                  onValueChange={(val) => handleCategoryNameChange(cat.id, val)}
                />

                <Button
                  type="button"
                  className="text-white bg-blue-500 m-auto"
                  color="default"
                  fullWidth

                  onPress={() => handleAddField(cat.id)}
                >
                  + Añadir campo
                </Button>

                {/* Render de cada campo dentro de la categoría */}
                {cat.fields.length > 0 && (
                  <div className="mt-2 space-y-3">
                    {cat.fields.map((field) => (
                      <div key={field.id} className="flex flex-col gap-3">
                        {/* Nombre del campo */}

                        <div className="flex gap-3">
                          <Input
                            label="Nombre del campo"
                            placeholder="Ej. Nombre completo"
                            value={field.name}
                            onValueChange={(val) =>
                              handleFieldNameChange(cat.id, field.id, val)
                            }
                          />

                          <Select
                            label="Tipo de campo"
                            placeholder="Selecciona tipo"
                            selectedKeys={new Set([field.fieldType])}
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys)[0];
                              handleFieldTypeChange(cat.id, field.id, selected as FieldType);
                            }}
                          >
                            <SelectItem key="boolean">Boolean</SelectItem>
                            <SelectItem key="number">Número</SelectItem>
                            <SelectItem key="texto">Texto</SelectItem>
                            <SelectItem key="firma">Firma</SelectItem>
                            <SelectItem key="check">Check</SelectItem>
                            <SelectItem key="opcion">Opción</SelectItem>
                            <SelectItem key="selector">Selector</SelectItem>
                            <SelectItem key="fecha">Fecha</SelectItem>
                            <SelectItem key="hora">Hora</SelectItem>
                          </Select>
                        </div>

                        {field.fieldType === "boolean" && (
                          <div className="flex gap-3">
                            <Input
                              label="Afirmación"
                              placeholder="Ej: Bueno/Si"
                              value={field.booleanOptions?.trueLabel || ""}
                              onValueChange={(val) =>
                                handleFieldChange(cat.id, field.id, "booleanOptions", {
                                  ...field.booleanOptions,
                                  trueLabel: val,
                                })
                              }
                            />
                            <Input
                              label="Negación"
                              placeholder="Ej: Malo/No"
                              value={field.booleanOptions?.falseLabel || ""}
                              onValueChange={(val) =>
                                handleFieldChange(cat.id, field.id, "booleanOptions", {
                                  ...field.booleanOptions,
                                  falseLabel: val,
                                })
                              }
                            />
                          </div>
                        )}
                        {field.fieldType === "selector" && (
                          <div className="flex gap-3">
                            <Select
                              label="Fuente"
                              selectedKeys={new Set([field.selectorOptions?.source || "vehiculos"])}
                              onSelectionChange={(keys) =>
                                handleFieldChange(cat.id, field.id, "selectorOptions", {
                                  ...field.selectorOptions,
                                  source: Array.from(keys)[0] as string,
                                })
                              }
                            >
                              <SelectItem key="vehiculos">Vehículos</SelectItem>
                            </Select>
                            <Select
                              label="Parámetro"
                              selectedKeys={new Set([field.selectorOptions?.parameter || ""])}
                              onSelectionChange={(keys) =>
                                handleFieldChange(cat.id, field.id, "selectorOptions", {
                                  ...field.selectorOptions,
                                  parameter: Array.from(keys)[0] as string,
                                })
                              }
                            >
                              {vehiculoParams.map(param => (
                                <SelectItem key={param}>{param}</SelectItem>
                              ))}
                            </Select>
                          </div>
                        )}
                        <Button
                          className="bg-red-600 text-white"
                          onPress={() => handleRemoveField(cat.id, field.id)}
                        >
                          X
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Botón final para "crear" el formulario */}
            <Button fullWidth className="bg-green-700 text-white" type="submit">
              Crear formulario
            </Button>
          </form>
        </div>

        <div className="md:col-span-1 lg:col-span-2 space-y-3">
          <h2 className="text-green-700 font-bold text-2xl">Formatos creados</h2>
          {
            state.formularios.length > 0 ? (
              state.formularios.map((formulario: Formulario) => (
                <Card key={formulario.FormularioId}>
                  <CardHeader className="">ID: {formulario.FormularioId}</CardHeader>
                  <Divider />
                  <CardBody>
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl">{formulario.Nombre}</h3>
                      <p>{formulario.Descripcion}</p>
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              <p>No hay formularios aún</p>
            )
          }
        </div>
      </div>
    </div>
  );
}
