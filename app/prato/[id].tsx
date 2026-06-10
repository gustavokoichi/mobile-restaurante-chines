import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { pratosApi, Prato } from "../../services/api";
import { COLORS, SPACING, RADIUS, FONT_SIZES, CATEGORY_ICONS } from "../../constants/theme";

export default function DetalhesPratoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [prato, setPrato] = useState<Prato | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    pratosApi.obter(Number(id))
      .then(setPrato)
      .catch((err) => { Alert.alert("Erro", err.message); router.back(); })
      .finally(() => setLoading(false));
  }, [id]);

  const confirmarDelete = () => {
    if (!prato) return;
    Alert.alert("Remover Prato", `Deseja remover "${prato.nome}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover", style: "destructive",
        onPress: async () => {
          try {
            await pratosApi.deletar(prato.id);
            router.replace("/");
          } catch (err: any) {
            Alert.alert("Erro", err.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }
  if (!prato) return null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>{CATEGORY_ICONS[prato.categoria] ?? "🍽️"}</Text>
        <View style={[styles.dispBadge, !prato.disponivel && styles.dispBadgeOff]}>
          <Text style={[styles.dispText, !prato.disponivel && styles.dispTextOff]}>
            {prato.disponivel ? "● Disponível" : "○ Indisponível"}
          </Text>
        </View>
      </View>

      <View style={styles.nameRow}>
        <Text style={styles.nome}>{prato.nome}</Text>
        <Text style={styles.preco}>R$ {prato.preco.toFixed(2).replace(".", ",")}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Ionicons name="grid-outline" size={18} color={COLORS.primary} />
          <Text style={styles.infoLabel}>Categoria</Text>
          <Text style={styles.infoValue}>{prato.categoria}</Text>
        </View>

        {prato.descricao ? (
          <>
            <View style={styles.divider} />
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Descrição</Text>
              </View>
              <Text style={styles.descricao}>{prato.descricao}</Text>
            </View>
          </>
        ) : null}
      </View>

      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color={COLORS.textLight} />
          <Text style={styles.infoLabel}>Cadastrado em</Text>
          <Text style={styles.infoValue}>{formatDate(prato.criado_em)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.editBtn}
        onPress={() => router.push(`/prato/editar/${prato.id}`)}>
        <Ionicons name="pencil" size={20} color="#FFF" />
        <Text style={styles.editBtnText}>Editar Prato</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={confirmarDelete}>
        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        <Text style={styles.deleteBtnText}>Remover Prato</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 48 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { backgroundColor: COLORS.surfaceWarm, borderRadius: 20, alignItems: "center",
    paddingVertical: SPACING.xl, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.borderLight, gap: SPACING.md },
  heroEmoji: { fontSize: 80 },
  dispBadge: { backgroundColor: "#E8F8F0", paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, borderRadius: RADIUS.round },
  dispBadgeOff: { backgroundColor: "#FDF2F2" },
  dispText: { fontSize: FONT_SIZES.sm, color: COLORS.success, fontWeight: "700" },
  dispTextOff: { color: COLORS.error },
  nameRow: { flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: SPACING.md, paddingHorizontal: 4 },
  nome: { flex: 1, fontSize: FONT_SIZES.xxl, fontWeight: "800",
    color: COLORS.text, marginRight: SPACING.md },
  preco: { fontSize: FONT_SIZES.xxl, fontWeight: "800", color: COLORS.primary },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.borderLight },
  infoRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  infoLabel: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textLight, fontWeight: "600" },
  infoValue: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: "600" },
  divider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: SPACING.sm },
  descricao: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, lineHeight: 22 },
  editBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    paddingVertical: SPACING.md, marginBottom: SPACING.sm, elevation: 4 },
  editBtnText: { fontSize: FONT_SIZES.lg, fontWeight: "800", color: "#FFF" },
  deleteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    paddingVertical: SPACING.md, borderWidth: 1.5, borderColor: "#FECACA" },
  deleteBtnText: { fontSize: FONT_SIZES.lg, fontWeight: "700", color: COLORS.error },
});
