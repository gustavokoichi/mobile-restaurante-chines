import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Switch, ActivityIndicator, Alert,
} from "react-native";
import { COLORS, CATEGORIES, CATEGORY_ICONS, SPACING, RADIUS, FONT_SIZES } from "../constants/theme";
import { PratoCreate } from "../services/api";

interface Props {
  initialData?: Partial<PratoCreate>;
  onSubmit: (data: PratoCreate) => Promise<void>;
  submitLabel: string;
}

export default function PratoForm({ initialData, onSubmit, submitLabel }: Props) {
  const [nome, setNome] = useState(initialData?.nome ?? "");
  const [descricao, setDescricao] = useState(initialData?.descricao ?? "");
  const [preco, setPreco] = useState(initialData?.preco ? String(initialData.preco) : "");
  const [categoria, setCategoria] = useState(initialData?.categoria ?? "");
  const [disponivel, setDisponivel] = useState(initialData?.disponivel ?? true);
  const [imagemUrl, setImagemUrl] = useState(initialData?.imagem_url ?? "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!nome.trim() || nome.trim().length < 2) errs.nome = "Nome deve ter ao menos 2 caracteres";
    const p = parseFloat(preco.replace(",", "."));
    if (isNaN(p) || p <= 0) errs.preco = "Preço deve ser positivo";
    if (!categoria) errs.categoria = "Selecione uma categoria";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        preco: parseFloat(preco.replace(",", ".")),
        categoria,
        disponivel,
        imagem_url: imagemUrl.trim() || undefined,
      });
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Erro ao salvar prato.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

      <View style={styles.field}>
        <Text style={styles.label}>Nome do Prato *</Text>
        <TextInput style={[styles.input, errors.nome ? styles.inputError : null]}
          placeholder="Ex: Frango Xadrez" placeholderTextColor={COLORS.textLight}
          value={nome} onChangeText={setNome} maxLength={100} />
        {errors.nome ? <Text style={styles.errText}>{errors.nome}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput style={[styles.input, styles.textarea]}
          placeholder="Descreva os ingredientes..." placeholderTextColor={COLORS.textLight}
          value={descricao} onChangeText={setDescricao} multiline
          numberOfLines={3} maxLength={500} textAlignVertical="top" />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Preço (R$) *</Text>
        <TextInput style={[styles.input, errors.preco ? styles.inputError : null]}
          placeholder="0,00" placeholderTextColor={COLORS.textLight}
          value={preco} onChangeText={setPreco} keyboardType="decimal-pad" />
        {errors.preco ? <Text style={styles.errText}>{errors.preco}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Categoria *</Text>
        {errors.categoria ? <Text style={styles.errText}>{errors.categoria}</Text> : null}
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat}
              style={[styles.chip, categoria === cat && styles.chipActive]}
              onPress={() => setCategoria(cat)}>
              <Text style={styles.chipEmoji}>{CATEGORY_ICONS[cat]}</Text>
              <Text style={[styles.chipText, categoria === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>URL da Imagem</Text>
        <TextInput style={styles.input} placeholder="https://..."
          placeholderTextColor={COLORS.textLight} value={imagemUrl}
          onChangeText={setImagemUrl} keyboardType="url" autoCapitalize="none" />
      </View>

      <View style={styles.switchRow}>
        <View>
          <Text style={styles.label}>Disponível no cardápio</Text>
          <Text style={styles.switchSub}>{disponivel ? "Visível para pedidos" : "Oculto do cardápio"}</Text>
        </View>
        <Switch value={disponivel} onValueChange={setDisponivel}
          trackColor={{ false: COLORS.disabled, true: COLORS.primaryLight }}
          thumbColor={disponivel ? COLORS.primary : "#F0F0F0"} />
      </View>

      <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>{submitLabel}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 48 },
  field: { marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZES.sm, fontWeight: "700", color: COLORS.text,
    marginBottom: SPACING.xs, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1.5,
    borderColor: COLORS.border, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2, fontSize: FONT_SIZES.md, color: COLORS.text },
  inputError: { borderColor: COLORS.error },
  textarea: { height: 90, paddingTop: SPACING.sm + 2 },
  errText: { fontSize: FONT_SIZES.xs, color: COLORS.error, marginTop: 4, fontWeight: "500" },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: SPACING.xs, gap: SPACING.xs },
  chip: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.round, borderWidth: 1.5,
    borderColor: COLORS.border, backgroundColor: COLORS.surface, gap: 4 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipEmoji: { fontSize: 14 },
  chipText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: "600" },
  chipTextActive: { color: "#FFF" },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.borderLight },
  switchSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  btn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    paddingVertical: SPACING.md, alignItems: "center", elevation: 4 },
  btnDisabled: { opacity: 0.7 },
  btnText: { fontSize: FONT_SIZES.lg, fontWeight: "800", color: "#FFF" },
});
