import LayoutPage from '@/app/tabela-chamados-abertos/components/Layout_Page';
import './style.css';
import { FiltersTabelaChamadosAbertosProvider } from '../../contexts/Filters_Tabela_Chamados_Abertos_Context';

export default function TabelaChamadosAbertosPage() {
  return (
    <FiltersTabelaChamadosAbertosProvider>
      <LayoutPage />
    </FiltersTabelaChamadosAbertosProvider>
  );
}
