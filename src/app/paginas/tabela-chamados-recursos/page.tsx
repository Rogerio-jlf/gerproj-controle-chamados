import LayoutPage from './Layout_Page';
import './style.css';
import { FiltersTabelaChamadosProvider } from '../../../contexts/firebird/Filters_Tabela_Chamados_Context';

export default function TabelaChamadosRecursosPage() {
  return (
    <FiltersTabelaChamadosProvider>
      <LayoutPage />
    </FiltersTabelaChamadosProvider>
  );
}
