import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
  Image,
} from "@react-pdf/renderer";
import { Button } from "@nextui-org/react";
import { BonificacionesAcc, Bono, Liquidacion } from "@/types/index";
import { formatDate, formatToCOP } from "@/helpers";
import { Font } from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "/fonts/Roboto-Regular.ttf", // Ruta local a la fuente en formato .ttf
      fontWeight: "normal",
    },
    {
      src: "/fonts/Roboto-Bold.ttf", // Ruta local a la fuente en formato .ttf
      fontWeight: "bold",
    },
  ],
});

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    backgroundColor: "#FFF", // Fondo gris claro para el PDF}
    fontFamily: "Roboto", // Usa una fuente predeterminada
    fontSize: 12,
    gap: 35,
  },
  header: {
    fontFamily: "Roboto", // Usa la fuente registrada
    fontWeight: "bold", // Aplica el peso
    fontSize: 24,
    marginBottom: 2,
    textAlign: "center",
    color: "#2E8B57", // Verde para el título principal
  },
  title: {
    fontFamily: "Roboto", // Usa la fuente registrada
    fontWeight: "bold", // Aplica el peso
    fontSize: 16,
    color: "#2E8B57", // Azul para los títulos de las secciones
    textAlign: "center",
  },
  label: {
    fontFamily: "Roboto", // Usa la fuente registrada
    fontWeight: "semibold", // Aplica el peso,
    fontSize: 12,
  },
  textValue: {
    fontFamily: "Roboto", // Usa la fuente registrada
    fontSize: 12,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1, // Simulación de sombra con borde
    borderColor: "#E0E0E0", // Color del borde más claro para simular sombra
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1, // Grosor del borde inferior
    borderBottomColor: "#E0E0E0", // Color del borde inferior
  },
  footer: {
    position: "absolute",
    fontSize: 10,
    bottom: 20,
    left: 30,
    center: 30,
    textAlign: "center",
    color: "#9E9E9E",
  },
});

type LiquidacionPDFProps = {
  item: Liquidacion | null; // Tipado del item basado en el tipo Liquidacion
};

// Componente que genera el PDF con la información del item
const LiquidacionPDF = ({ item }: LiquidacionPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <View
          style={{
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <Image
            style={{
              width: 150,
              position: "absolute",
              height: 90,
              objectFit: "cover",
            }}
            source={"/codi.png"}
          />
        </View>
        <Text style={styles.header}>LIQUIDACION #{item?.id}</Text>
      </View>

      <View style={{ paddingHorizontal: 65, gap: 20 }}>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.textValue}>
              {item?.conductor?.nombre} {item?.conductor?.apellido}
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>C.C.</Text>
            <Text style={styles.textValue}>{item?.conductor?.cc}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Días laborados</Text>
            <Text style={styles.textValue}>{item?.diasLaborados}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Salario básico</Text>
            <Text
              style={[
                styles.textValue,
                {
                  color: "#007AFF",
                  backgroundColor: "#007bff1e",
                  padding: 3,
                  borderRadius: 5,
                  fontSize: 14,
                },
              ]}
            >
              {formatToCOP(item?.conductor?.salarioBase)}
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Auxilio de transporte</Text>
            <Text
              style={[
                styles.textValue,
                {
                  color: "#00000074",
                  backgroundColor: "#00000024",
                  padding: 3,
                  borderRadius: 5,
                  fontSize: 14,
                },
              ]}
            >
              {formatToCOP(item?.auxilioTransporte)}
            </Text>
          </View>
          <View style={[styles.cardRow, { borderBottom: 0 }]}>
            <Text style={styles.label}>Ajuste villanueva</Text>
            <Text>
              {item?.diasLaboradosVillanueva}{' '}días
            </Text>
            <Text
              style={[
                styles.textValue,
                {
                  color: "#FF9500",
                  backgroundColor: "#FF95001e",
                  padding: 3,
                  borderRadius: 5,
                  fontSize: 14,
                },
              ]}
            >
              {formatToCOP(item?.ajusteSalarial)}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>
          {`${formatDate(item?.periodoStart)} - ${formatDate(item?.periodoEnd)}`}
        </Text>

        <View style={styles.card}>
          <View
            style={[
              styles.cardRow,
              {
                backgroundColor: "#2E8B571e",
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                color: "#2E8B57",
              },
            ]}
          >
            <Text style={[styles.label, { flex: 2, textAlign: "left" }]}>
              Concepto
            </Text>
            <Text style={[styles.label, { flex: 1, textAlign: "center" }]}>
              Observación
            </Text>
            <Text style={[styles.label, { flex: 1, textAlign: "center" }]}>
              Cantidad
            </Text>
            <Text style={[styles.label, { flex: 1, textAlign: "center" }]}>
              Valor
            </Text>
          </View>

          {item?.bonificaciones &&
            Object.values(
              item.bonificaciones.reduce(
                (acc: BonificacionesAcc, bonificacion: Bono) => {
                  // Sumamos la cantidad de bonificaciones y el valor total
                  const totalQuantity = bonificacion.values.reduce(
                    (sum, val) => sum + (val.quantity || 0),
                    0
                  );

                  if (acc[bonificacion.name]) {
                    // Si ya existe la bonificación, sumamos la cantidad y el valor total
                    acc[bonificacion.name].quantity += totalQuantity;
                    acc[bonificacion.name].totalValue +=
                      totalQuantity * bonificacion.value;
                  } else {
                    // Si no existe, la añadimos al acumulador
                    acc[bonificacion.name] = {
                      name: bonificacion.name,
                      quantity: totalQuantity,
                      totalValue: totalQuantity * bonificacion.value,
                    };
                  }
                  return acc;
                },
                {}
              )
            ).map((bono: any) => (
              <View key={bono.name} style={[styles.cardRow]}>
                <Text style={[styles.label, { flex: 2, textAlign: "left" }]}>
                  {bono.name || ""}
                </Text>
                <Text
                  style={[styles.textValue, { flex: 1, textAlign: "center" }]}
                ></Text>
                <Text
                  style={[styles.textValue, { flex: 1, textAlign: "center" }]}
                >
                  {bono.quantity}
                </Text>
                <Text
                  style={[styles.textValue, { flex: 1, textAlign: "center" }]}
                >
                  {formatToCOP(bono.totalValue)}
                </Text>
              </View>
            ))}

          {item?.pernotes?.map((pernote) => (
            <View key={pernote.id} style={[styles.cardRow]}>
              <Text style={[styles.label, { flex: 2 }]}>Pernote</Text>
              <Text
                style={[styles.textValue, { flex: 1, textAlign: "center", fontSize: 10 }]}
              >
                {pernote.fechas.join(' ')}
              </Text>
              <Text
                style={[styles.textValue, { flex: 1, textAlign: "center" }]}
              >
                {pernote.fechas?.length}
              </Text>
              <Text
                style={[styles.textValue, { flex: 1, textAlign: "center" }]}
              >
                {formatToCOP(item.totalPernotes)}
              </Text>
            </View>
          ))}

          <View style={[styles.cardRow, {
            borderBottom: 0
          }]}>
            <Text style={[styles.label, { flex: 2 }]}>Recargo</Text>
            <Text style={[styles.textValue, { flex: 1, textAlign: "center" }]}>
            <Text></Text>
            </Text>
            <Text style={[styles.textValue, { flex: 1, textAlign: "center" }]}>
              {item?.recargos?.length}
            </Text>
            <Text style={[styles.textValue, { flex: 1, textAlign: "center" }]}>
              {formatToCOP(item?.totalRecargos)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={[styles.cardRow, { borderBottom: 0 }]}>
            <Text style={styles.label}>Salario total</Text>
            <Text
              style={[
                styles.textValue,
                {
                  color: "#2E8B57",
                  backgroundColor: "#2E8B571e",
                  padding: 3,
                  borderRadius: 5,
                  fontSize: 16,
                },
              ]}
            >
              {formatToCOP(item?.sueldoTotal)}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

// Función para generar el PDF y descargarlo
const handleGeneratePDF = async (item: Liquidacion | null): Promise<void> => {
  const blob = await pdf(<LiquidacionPDF item={item} />).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url); // Abre el PDF en una nueva pestaña
};

type PdfMakerProps = {
  children: React.ReactNode; // Tipado de children como nodo React
  item: Liquidacion | null; // Tipo de item basado en LiquidacionInput
  hasTooltip?: boolean; // Tooltip es opcional
};

// Componente que renderiza el botón y genera el PDF
const PdfMaker = ({ children, item }: PdfMakerProps) => {
  return (
    <Button
      color="secondary"
      className="h-10 w-full"
      isIconOnly
      onPress={() => handleGeneratePDF(item)}
    >
      {children}
    </Button>
  );
};

export default PdfMaker;
