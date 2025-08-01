import LayoutPage from '@/app/paginas/tabela-chamados/components/Layout_Page';
import './style.css';
import { FiltersTabelaChamadosProvider } from '../../../contexts/Filters_Tabela_Chamados_Context';

export default function TabelaChamadosPage() {
  return (
    <FiltersTabelaChamadosProvider>
      <LayoutPage />
    </FiltersTabelaChamadosProvider>
  );
}
