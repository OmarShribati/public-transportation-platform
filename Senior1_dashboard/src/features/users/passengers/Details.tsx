import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Debug } from '@/components/shared/Debug';
import { PaymentCard } from '@/components/shared/PaymentCard';
import { useSearch } from '@tanstack/react-router';
import { PassengerAPI } from './api';
import { Wallet, QrCode, User, Mail, ShieldCheck, Calendar, Layers, Ticket } from 'lucide-react';

export const Details = () => {
  const { row } = useSearch({ strict: false }) as { row: any };

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const [cardData, setCardData] = useState<any>(row?.cardDetails || null);

  useEffect(() => {
    const fetchCardData = async () => {
      if (!row?.id) return;

      try {
        setIsFetching(true);
        const response = await PassengerAPI.viewCard(row.id);
        
        if (response && response.card) {
          setCardData(response.card);
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error("API Error (Fetch Card):", error);
          toast.error('حدث خطأ أثناء جلب بيانات البطاقة');
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchCardData();
  }, [row?.id]);

  const handleAddNewCard = async () => {
    if (!row?.id) {
      toast.error('لم يتم العثور على مُعرف المستخدم (Owner ID)');
      return;
    }

    try {
      setIsCreating(true);
      const response = await PassengerAPI.createCard({
        owner_id: row.id,
      });

      toast.success('تم إنشاء البطاقة بنجاح');
      setCardData(response.card || response); 
    } catch (error: any) {
      console.error("API Error:", error);
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'حدث خطأ أثناء إنشاء البطاقة';
        
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!cardData?.card_id) {
      toast.error('لم يتم العثور على مُعرف البطاقة');
      return;
    }

    const currentStatus = cardData.status?.toLowerCase();
    const targetStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      setIsUpdatingStatus(true);
      const response = await PassengerAPI.updateCardStatus(cardData.card_id, targetStatus);

      toast.success('تم تحديث حالة البطاقة بنجاح');

      setCardData((prev: any) => {
        const updatedStatus = response?.card?.status || response?.status;
        const newStatus = updatedStatus || targetStatus;
        
        return {
          ...prev,
          status: newStatus
        };
      });
    } catch (error: any) {
      console.error("API Error:", error);
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'حدث خطأ أثناء تحديث حالة البطاقة';
        
      toast.error(errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      
      {cardData ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">معلومات البطاقة</p>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{cardData.card_number}</p>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mt-1 block">
                  {cardData.qr_token}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <QrCode className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">صاحب البطاقة والحالة</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{cardData.owner_name}</p>
                <span className={`inline-block px-2.5 py-0.5 text-xs rounded-full mt-1 font-bold ${
                  cardData.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                }`}>
                  {cardData.status}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

          </div>

          {cardData.subscriptions && cardData.subscriptions.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">الاشتراكات الفعالة</h3>
                </div>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full font-bold">
                  {cardData.subscriptions.length} اشتراك
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cardData.subscriptions.map((sub: any) => (
                  <div key={sub.subscription_id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{sub.zone_name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">Level {sub.zone_level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 uppercase">
                          {sub.subscription_type}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          sub.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {sub.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex justify-between">
                        <span>البداية:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">{new Date(sub.start_date).toLocaleDateString('en-GB')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>النهاية:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">{new Date(sub.end_date).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      <PaymentCard
        data={cardData}
        onAddCard={handleAddNewCard}
        isLoading={isCreating || isFetching} 
        onToggleStatus={handleUpdateStatus} 
        isUpdatingStatus={isUpdatingStatus} 
      />
    </div>
  );
};