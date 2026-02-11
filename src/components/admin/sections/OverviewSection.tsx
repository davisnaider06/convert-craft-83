import { useEffect, useState } from "react";
import { AdminMetricCard } from "../AdminMetricCard";
import {
  Users,
  CreditCard,
  Coins,
  TrendingUp,
  UserCheck,
  UserX,
  Crown,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

interface OverviewData {
  totalUsers: number;
  activeSubscribers: number;
  freeUsers: number;
  proSubscribers: number;
  annualSubscribers: number;
  mrr: number;
  arr: number;
  totalRevenue: number;
  churnRate: number;
  conversionRate: number;
}

export function OverviewSection() {
  const [data, setData] = useState<OverviewData>({
    totalUsers: 0,
    activeSubscribers: 0,
    freeUsers: 0,
    proSubscribers: 0,
    annualSubscribers: 0,
    mrr: 0,
    arr: 0,
    totalRevenue: 0,
    churnRate: 0,
    conversionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  async function fetchOverviewData() {
    setIsLoading(true);

    try {
      // SIMULAÇÃO: Delay de rede para parecer real
      await new Promise(r => setTimeout(r, 1000));

      // Dados Estatísticos Mockados
      const mockStats = {
        freeUsers: 1240,
        proSubscribers: 156, // R$ 67/mês
        annualSubscribers: 42, // R$ 247/ano
        churnRate: 2.4,
      };

      const totalUsers = mockStats.freeUsers + mockStats.proSubscribers + mockStats.annualSubscribers;
      const activeSubscribers = mockStats.proSubscribers + mockStats.annualSubscribers;

      // Calcular MRR (R$67/mês pro + R$247/12 anual)
      const mrr = (mockStats.proSubscribers * 67) + (mockStats.annualSubscribers * (247 / 12));
      const arr = mrr * 12;

      // Taxa de conversão
      const conversionRate = totalUsers > 0 ? (activeSubscribers / totalUsers) * 100 : 0;

      setData({
        totalUsers,
        activeSubscribers,
        freeUsers: mockStats.freeUsers,
        proSubscribers: mockStats.proSubscribers,
        annualSubscribers: mockStats.annualSubscribers,
        mrr,
        arr,
        totalRevenue: arr, // Simplificação para demo
        churnRate: mockStats.churnRate,
        conversionRate,
      });
    } catch (error) {
      console.error("Error fetching overview data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl bg-muted/50"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold">Visão Geral</h2>
        <p className="text-muted-foreground">Métricas principais do Boder AI (Simulação)</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard
          title="Total de Usuários"
          value={data.totalUsers}
          icon={Users}
          delay={0}
        />
        <AdminMetricCard
          title="Assinantes Ativos"
          value={data.activeSubscribers}
          icon={UserCheck}
          variant="success"
          delay={0.1}
        />
        <AdminMetricCard
          title="Usuários Free"
          value={data.freeUsers}
          icon={UserX}
          delay={0.2}
        />
        <AdminMetricCard
          title="MRR"
          value={formatCurrency(data.mrr)}
          icon={TrendingUp}
          variant="success"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard
          title="Plano Pro"
          value={data.proSubscribers}
          subtitle="R$67/mês"
          icon={Zap}
          delay={0.4}
        />
        <AdminMetricCard
          title="Plano Anual"
          value={data.annualSubscribers}
          subtitle="R$247/ano"
          icon={Crown}
          delay={0.5}
        />
        <AdminMetricCard
          title="ARR"
          value={formatCurrency(data.arr)}
          icon={CreditCard}
          variant="success"
          delay={0.6}
        />
        <AdminMetricCard
          title="Taxa de Conversão"
          value={`${data.conversionRate.toFixed(1)}%`}
          subtitle="Free → Pago"
          icon={Coins}
          delay={0.7}
        />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-6 backdrop-blur-xl"
        >
          <h3 className="text-lg font-semibold">💰 Receita Total Estimada</h3>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(data.totalRevenue)}</p>
          <p className="mt-1 text-sm text-muted-foreground">Baseado nas assinaturas ativas</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6 backdrop-blur-xl"
        >
          <h3 className="text-lg font-semibold">📊 Churn Rate</h3>
          <p className="mt-2 text-3xl font-bold">{data.churnRate}%</p>
          <p className="mt-1 text-sm text-muted-foreground">Taxa de cancelamento mensal</p>
        </motion.div>
      </div>
    </div>
  );
}