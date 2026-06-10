import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import PratoForm from "../../../components/PratoForm";
import { pratosApi, Prato, PratoCreate } from "../../../services/api";
import { COLORS } from "../../../constants/theme";

export default function EditarPratoScreen() {
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

  const handleSubmit = async (data: PratoCreate) => {
    await pratosApi.atualizar(Number(id), data);
    router.replace(`/prato/${id}`);
  };

  if (loading || !prato) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <PratoForm
      initialData={{
        nome: prato.nome,
        descricao: prato.descricao,
        preco: prato.preco,
        categoria: prato.categoria,
        disponivel: prato.disponivel,
        imagem_url: prato.imagem_url,
      }}
      onSubmit={handleSubmit}
      submitLabel="Salvar Alterações"
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});
