import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, TrendingUp, DollarSign, Users, Calendar } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalyticsData {
  planDistribution: Array<{ name: string; value: number; color: string }>;
  userGrowth: Array<{ month: string; users: number }>;
  revenueByPeriod: Array<{ period: string; revenue: number; count: number }>;
  revenueByType: Array<{ type: string; revenue: number; color: string }>;
  dailyRevenue: Array<{ date: string; revenue: number }>;
}

export function AnalyticsSection() {
  const [data, setData] = useState<AnalyticsData>({
    planDistribution: [],
    userGrowth: [],
    revenueByPeriod: [],
    revenueByType: [],
    dailyRevenue: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    setIsLoading(true);
    
    // SIMULATION: Fetching data (Mock)
    try {
      await new Promise(r => setTimeout(r, 1200)); // Fake loading delay

      // Mock Daily Revenue (Last 30 days)
      const mockDailyRevenue = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return {
          date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          revenue: Math.floor(Math.random() * 500) + 100 + (i * 10), // Trending up
        };
      });

      // Mock Plan Distribution
      const mockPlanDistribution = [
        { name: "Free", value: 450, color: "#6b7280" },
        { name: "Pro", value: 120, color: "#3ECFB2" },
        { name: "Anual", value: 45, color: "#f59e0b" },
      ];

      // Mock User Growth
      const mockUserGrowth = [
        { month: 'Ago', users: 120 },
        { month: 'Set', users: 180 },
        { month: 'Out', users: 250 },
        { month: 'Nov', users: 390 },
        { month: 'Dez', users: 510 },
        { month: 'Jan', users: 615 },
      ];

      // Mock Revenue by Period (Monthly)
      const mockRevenueByPeriod = [
        { period: 'Ago', revenue: 1200, count: 20 },
        { period: 'Set', revenue: 1800, count: 35 },
        { period: 'Out', revenue: 2500, count: 45 },
        { period: 'Nov', revenue: 3900, count: 70 },
        { period: 'Dez', revenue: 5100, count: 95 },
        { period: 'Jan', revenue: 6800, count: 120 },
      ];

      // Mock Revenue by Type
      const mockRevenueByType = [
        { type: "Assinaturas", revenue: 15400, color: "#3ECFB2" },
        { type: "Créditos", revenue: 4200, color: "#3b82f6" },
        { type: "Reembolsos", revenue: 350, color: "#ef4444" },
      ];

      setData({
        planDistribution: mockPlanDistribution,
        userGrowth: mockUserGrowth,
        revenueByPeriod: mockRevenueByPeriod,
        revenueByType: mockRevenueByType,
        dailyRevenue: mockDailyRevenue,
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const totalRevenue = data.dailyRevenue.reduce((acc, d) => acc + d.revenue, 0);
  const avgDailyRevenue = data.dailyRevenue.length > 0 
    ? totalRevenue / data.dailyRevenue.length 
    : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold">Analytics de Receita</h2>
          <p className="text-muted-foreground">Métricas e gráficos baseados em dados (Simulação)</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/20 p-3">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receita no Período</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/20 p-3">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Média Diária</p>
              <p className="text-2xl font-bold">{formatCurrency(avgDailyRevenue)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/20 p-3">
              <Users className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Usuários</p>
              <p className="text-2xl font-bold">
                {data.planDistribution.reduce((acc, p) => acc + p.value, 0)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily Revenue Evolution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-full rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl"
        >
          <h3 className="mb-4 text-lg font-semibold">Evolução de Receita (Diária)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.dailyRevenue}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3ECFB2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3ECFB2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [formatCurrency(value), "Receita"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3ECFB2"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl"
        >
          <h3 className="mb-4 text-lg font-semibold">Receita Mensal</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.revenueByPeriod}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="period" stroke="#888" />
              <YAxis stroke="#888" tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [formatCurrency(value), "Receita"]}
              />
              <Bar dataKey="revenue" fill="#3ECFB2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl"
        >
          <h3 className="mb-4 text-lg font-semibold">Receita por Tipo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.revenueByType}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="revenue"
                label={({ type, percent }) =>
                  `${type} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.revenueByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [formatCurrency(value), "Receita"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Plan Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl"
        >
          <h3 className="mb-4 text-lg font-semibold">Distribuição de Planos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.planDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl"
        >
          <h3 className="mb-4 text-lg font-semibold">Crescimento de Usuários</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#f59e0b" 
                strokeWidth={2} 
                dot={{ fill: "#f59e0b", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}