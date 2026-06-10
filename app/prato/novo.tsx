import React from "react";
import { useRouter } from "expo-router";
import PratoForm from "../../components/PratoForm";
import { pratosApi, PratoCreate } from "../../services/api";

export default function NovoPratoScreen() {
  const router = useRouter();

  const handleSubmit = async (data: PratoCreate) => {
    await pratosApi.criar(data);
    router.replace("/");
  };

  return <PratoForm onSubmit={handleSubmit} submitLabel="Cadastrar Prato" />;
}
