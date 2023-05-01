import { toast } from 'bulma-toast';

export default function FoodNotification({ msg, color }) {
    toast({
        message: msg,
        type: color,
        duration: 3000,
        opacity: 1,
        single: true,
        position: 'bottom-left',
        animate: { in: 'fadeIn', out: 'fadeOut' }
    });
    return null;
}
