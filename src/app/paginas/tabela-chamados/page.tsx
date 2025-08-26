import LayoutPage from '@/app/paginas/tabela-chamados/components/Layout_Page';
import './style.css';
import { FiltersTabelaChamadosAbertosProvider } from '../../../contexts/firebird/Filters_Tabela_Chamados_Context';

export default function TabelaChamadosAbertosPage() {
  return (
    <FiltersTabelaChamadosAbertosProvider>
      <LayoutPage />
    </FiltersTabelaChamadosAbertosProvider>
  );
}
