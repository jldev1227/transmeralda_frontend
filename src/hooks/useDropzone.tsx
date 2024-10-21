import { useCallback, useState } from "react";
import { useDropzone, DropEvent, FileRejection } from "react-dropzone";
import { useMediaQuery } from "./useMediaQuery";
import { Card, CardBody } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Button } from "@nextui-org/button";

interface DropzoneProps {
  onFileUploaded?: (file: FileDetailsVehiculos, acceptedFile: File) => void; // Para subir un archivo
  onFileRemoved?: (fileId: string) => void; // Nuevo: Para eliminar un archivo
  label?: string;
}

export type FileDetailsVehiculos = {
  id: string;
  name: string;
  size: number;
  type: string;
  category?: string; // Por ejemplo: "Tarjeta de propiedad", "SOAT", etc.
  realFile: File; // Añadimos el archivo real aquí
};

const Dropzone: React.FC<DropzoneProps> = ({ onFileUploaded, onFileRemoved, label }) => {
  // Estado para almacenar el archivo seleccionado
  const [file, setFile] = useState<FileDetailsVehiculos | null>(null);

  // Función para manejar el drop de archivos
  const onDrop = useCallback(
    (
      acceptedFiles: File[], // Cambié a plural porque React Dropzone maneja un array
      fileRejections: FileRejection[],
      event: DropEvent
    ): void => {
      const acceptedFile = acceptedFiles[0]; // Solo tomamos el primer archivo
      if (acceptedFile) {
        const newFile: FileDetailsVehiculos = {
          id: `${acceptedFile.name}-${acceptedFile.lastModified}`,
          name: acceptedFile.name,
          size: acceptedFile.size,
          type: acceptedFile.type,
          category: label, // El label se utiliza para categorizar el archivo.
          realFile: acceptedFile, // Aquí estamos asignando el archivo real
        };
  
        setFile(newFile);
  
        // Si hay un callback externo para manejar el archivo
        if (onFileUploaded) {
          onFileUploaded(newFile, acceptedFile); // Pasamos el archivo real también
        }
      }
    },
    [onFileUploaded, label]
  );
  

  // Función para eliminar el archivo
  const handleRemoveFile = () => {
    if (file) {
      if (onFileRemoved) {
        onFileRemoved(file.id); // Notifica al componente padre que se eliminó un archivo
      }
      setFile(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1, // Solo permitir un archivo
  });

  const isMobile = useMediaQuery("(max-width: 680px)"); // Tailwind `sm` breakpoint

  return (
    <div className="space-y-3">
      <h3 style={{ fontWeight: "bold" }}>{label}</h3>
      {!file && (
        <div {...getRootProps()} style={styles.dropzone}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Suelta los archivos aquí ...</p>
          ) : (
            <p>
              Arrastra y suelta el archivo aquí, o haz clic para seleccionar el archivo
            </p>
          )}
        </div>
      )}
      {file && (
        <div className="space-y-4">
          <Card key={file.id}>
            <CardBody className="flex-row items-center justify-between">
              <Image
                style={{ objectFit: "contain" }}
                src="/assets/pdfIcon.png"
                width={42}
                height={42}
                alt="Pdf icon"
              />
              <p
                style={{
                  width: "60%",
                  maxWidth: "400px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  fontSize: isMobile ? 14 : 16,
                }}
              >
                {file.name}
              </p>
              {!isMobile && (
                <p style={{ color: "#0072F5" }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
              <Button
                isIconOnly
                style={{
                  height: "24px",
                  padding: "0",
                  lineHeight: "1",
                  backgroundColor: "#f44336",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={handleRemoveFile}
              >
                X
              </Button>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  dropzone: {
    border: "2px dashed #cccccc",
    borderRadius: "10px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    marginBottom: "20px",
  },
};

export default Dropzone;
