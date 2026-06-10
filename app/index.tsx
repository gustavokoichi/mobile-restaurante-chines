import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert, RefreshControl, ScrollView,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { pratosApi, Prato } from "../services/api";
import { COLORS, SPACING, RADIUS, FONT_SIZES, CATEGORIES, CATEGORY_ICONS } from "../constants/theme";

export default function HomeScreen() {
  const router = useRouter();
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);

  const carregar = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await pratosApi.listar({
        busca: busca || undefined,
        categoria: categoriaFiltro || undefined,
      });
      setPratos(data.pratos);
      setTotal(data.total);
    } catch (err: any) {
      Alert.alert("Erro de conexão", "Verifique se o backend está rodando.\n\n" + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [busca, categoriaFiltro]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const confirmarDelete = (prato: Prato) => {
    Alert.alert("Remover Prato", `Deseja remover "${prato.nome}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover", style: "destructive",
        onPress: async () => {
          try {
            await pratosApi.deletar(prato.id);
            carregar();
          } catch (err: any) {
            Alert.alert("Erro", err.message);
          }
        },
      },
    ]);
  };

  const renderPrato = ({ item }: { item: Prato }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}
      onPress={() => router.push(`/prato/${item.id}`)}>
      <View style={styles.cardRow}>
        <View style={styles.emojiBox}>
          <Text style={styles.emoji}>{CATEGORY_ICONS[item.categoria] ?? "🍽️"}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNome} numberOfLines={1}>{item.nome}</Text>
          <Text style={styles.cardCategoria}>{item.categoria}</Text>
          <View style={[styles.dispBadge, !item.disponivel && styles.dispBadgeOff]}>
            <Text style={[styles.dispText, !item.disponivel && styles.dispTextOff]}>
              {item.disponivel ? "● Disponível" : "○ Indisponível"}
            </Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.preco}>R$ {item.preco.toFixed(2).replace(".", ",")}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnEdit}
              onPress={() => router.push(`/prato/editar/${item.id}`)}>
              <Ionicons name="pencil" size={15} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnDel}
              onPress={() => confirmarDelete(item)}>
              <Ionicons name="trash" size={15} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cardápio Imperial</Text>
        <Text style={styles.headerSub}>{total} {total === 1 ? "prato" : "pratos"}</Text>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={COLORS.textLight} />
        <TextInput style={styles.searchInput} placeholder="Buscar prato..."
          placeholderTextColor={COLORS.textLight} value={busca}
          onChangeText={setBusca} onSubmitEditing={() => carregar()} returnKeyType="search" />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca("")}>
            <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {["Todos", ...CATEGORIES].map((cat) => {
          const active = cat === "Todos" ? !categoriaFiltro : categoriaFiltro === cat;
          return (
            <TouchableOpacity key={cat}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setCategoriaFiltro(cat === "Todos" ? null : cat)}>
              {cat !== "Todos" && <Text style={styles.chipEmoji}>{CATEGORY_ICONS[cat]} </Text>}
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList data={pratos} keyExtractor={(i) => String(i.id)} renderItem={renderPrato}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing}
            onRefresh={() => carregar(true)} colors={[COLORS.primary]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 56 }}>🍽️</Text>
              <Text style={styles.emptyTitle}>Cardápio vazio</Text>
              <Text style={styles.emptyText}>Toque no + para adicionar o primeiro prato!</Text>
            </View>
          }
          showsVerticalScrollIndicator={false} />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/prato/novo")}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.lg },
  headerTitle: { fontSize: FONT_SIZES.xxl, fontWeight: "800", color: "#FFF" },
  headerSub: { fontSize: FONT_SIZES.sm, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  searchRow: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md, marginTop: SPACING.md, borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2,
    borderWidth: 1.5, borderColor: COLORS.border, gap: SPACING.sm },
  searchInput: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text },
  filterScroll: { maxHeight: 48, marginTop: SPACING.sm },
  filterContent: { paddingHorizontal: SPACING.md, alignItems: "center", gap: SPACING.xs },
  chip: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.md,
    paddingVertical: 6, borderRadius: RADIUS.round, backgroundColor: COLORS.surface,
    borderWidth: 1.5, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipEmoji: { fontSize: 13 },
  chipText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: "500" },
  chipTextActive: { color: "#FFF", fontWeight: "700" },
  list: { padding: SPACING.md, paddingBottom: 100, gap: SPACING.sm },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.borderLight, elevation: 2 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  emojiBox: { width: 50, height: 50, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceWarm,
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.borderLight },
  emoji: { fontSize: 26 },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: FONT_SIZES.lg, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  cardCategoria: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginBottom: 4 },
  dispBadge: { alignSelf: "flex-start", backgroundColor: "#E8F8F0", paddingHorizontal: SPACING.sm,
    paddingVertical: 2, borderRadius: RADIUS.round },
  dispBadgeOff: { backgroundColor: "#FDF2F2" },
  dispText: { fontSize: FONT_SIZES.xs, color: COLORS.success, fontWeight: "600" },
  dispTextOff: { color: COLORS.error },
  cardRight: { alignItems: "flex-end", gap: SPACING.sm },
  preco: { fontSize: FONT_SIZES.lg, fontWeight: "800", color: COLORS.primary },
  actions: { flexDirection: "row", gap: SPACING.xs },
  btnEdit: { padding: 6, borderRadius: RADIUS.sm, backgroundColor: "#FEF9F0",
    borderWidth: 1, borderColor: COLORS.borderLight },
  btnDel: { padding: 6, borderRadius: RADIUS.sm, backgroundColor: "#FEF2F2",
    borderWidth: 1, borderColor: "#FECACA" },
  empty: { alignItems: "center", paddingTop: 80, gap: SPACING.sm },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: "700", color: COLORS.text },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textLight, textAlign: "center" },
  fab: { position: "absolute", bottom: 28, right: 24, width: 60, height: 60,
    borderRadius: 30, backgroundColor: COLORS.primary, alignItems: "center",
    justifyContent: "center", elevation: 8 },
});
