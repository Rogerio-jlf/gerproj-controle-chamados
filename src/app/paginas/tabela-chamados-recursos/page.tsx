import LayoutPage from '@/app/paginas/tabela-chamados-recursos/components/Layout_Page';
import './style.css';
import { FiltersTabelaChamadosAbertosProvider } from '../../../contexts/firebird/Filters_Tabela_Chamados_Abertos_Context';

export default function TabelaChamadosRecursosPage() {
  return (
    <FiltersTabelaChamadosAbertosProvider>
      <LayoutPage />
    </FiltersTabelaChamadosAbertosProvider>
  );
}
