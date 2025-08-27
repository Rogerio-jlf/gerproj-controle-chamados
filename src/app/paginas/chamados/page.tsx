import LayoutPage from './Layout_Page';
import './style.css';
import { FiltersTabelaChamadosProvider } from '../../../contexts/Filters_Context';

export default function TabelaChamadosRecursosPage() {
  return (
    <FiltersTabelaChamadosProvider>
      <LayoutPage />
    </FiltersTabelaChamadosProvider>
  );
}
