import { redirect } from 'next/navigation';

export default function MerchantInventoryRedirectPage() {
  redirect('/merchant/catalog');
}
