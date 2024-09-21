import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
  Image,
} from "@react-pdf/renderer";
import { Button, Tooltip } from "@nextui-org/react";
import { Liquidacion } from "@/types/index";
import { formatDateRange, formatToCOP } from "@/helpers";
import { Font } from '@react-pdf/renderer';


Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: '/fonts/Roboto-Regular.ttf', // Ruta local a la fuente en formato .ttf
      fontWeight: 'normal',
    },
    {
      src: '/fonts/Roboto-Bold.ttf', // Ruta local a la fuente en formato .ttf
      fontWeight: 'bold',
    },
  ],
});

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 65,
    backgroundColor: "#F5F5F5", // Fondo gris claro para el PDF}
    fontFamily: "Helvetica", // Usa una fuente predeterminada
    fontSize: 12,
  },
  header: {
    fontFamily: 'Roboto', // Usa la fuente registrada
    fontWeight: 'bold', // Aplica el peso
    fontSize: 24,
    marginBottom: 12,
    textAlign: "center",
    color: "#2E8B57", // Verde para el título principal
  },
  title: {
    fontFamily: 'Roboto', // Usa la fuente registrada
    fontWeight: 'bold', // Aplica el peso
    fontSize: 16,
    color: "#2E8B57", // Azul para los títulos de las secciones
    marginBottom: 12,
    textAlign: "center",
  },
  text: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  label: {
    fontWeight: 700,
  },
  card: {
    backgroundColor: "#F7F7F7",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1, // Simulación de sombra con borde
    borderColor: "#E0E0E0", // Color del borde más claro para simular sombra
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 14
  },
  footer: {
    position: "absolute",
    fontSize: 10,
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#9E9E9E",
  },
});

type LiquidacionPDFProps = {
  item: Liquidacion; // Tipado del item basado en el tipo Liquidacion
};

// Componente que genera el PDF con la información del item
const LiquidacionPDF = ({ item }: LiquidacionPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <Text style={styles.header}>LIQUIDACION #{item.id}</Text>
        <Text style={styles.title}>
          {`${formatDateRange(item.periodo?.start)} - ${formatDateRange(item.periodo?.end)}`}
        </Text>
        <Text style={styles.text}>
          {item.conductor?.nombre} {item.conductor?.apellido}
        </Text>
        <Text style={styles.text}>C.C. {item.conductor?.cc}</Text>
      </View>
      {/* Ajuste de los componentes del Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.label}>Salario básico</Text>
          <View>
            <Text>{formatToCOP(item.conductor?.salarioBase ?? 0)}</Text>
          </View>
        </View>
        <View>
          <Text>
            Make beautiful websites regardless of your design experience.
          </Text>
        </View>
        <View>
          {/* Aquí puedes añadir contenido para el pie de la tarjeta si lo necesitas */}
        </View>
      </View>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          style={{
            width: 350,
            height: 210,
          }}
          source={"/codi.png"}
        />
      </View>
    </Page>
  </Document>
);

// Función para generar el PDF y descargarlo
const handleGeneratePDF = async (item: Liquidacion): Promise<void> => {
  const blob = await pdf(<LiquidacionPDF item={item} />).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url); // Abre el PDF en una nueva pestaña
};

type PdfMakerProps = {
  children: React.ReactNode; // Tipado de children como nodo React
  item: Liquidacion; // Tipo de item basado en Liquidacion
  hasTooltip?: boolean; // Tooltip es opcional
};

// Componente que renderiza el botón y genera el PDF
const PdfMaker = ({ children, item, hasTooltip = false }: PdfMakerProps) => {
  return (
    <>
      {hasTooltip && (
        <Tooltip content="Ver" color="secondary">
          <Button
            color="secondary"
            className="h-9 w-full"
            isIconOnly
            onPress={() => handleGeneratePDF(item)}
          >
            {children}
          </Button>
        </Tooltip>
      )}

      {!hasTooltip && (
        <Button
          color="secondary"
          className="h-10 w-full"
          isIconOnly
          onPress={() => handleGeneratePDF(item)}
        >
          {children}
        </Button>
      )}
    </>
  );
};

export default PdfMaker;
