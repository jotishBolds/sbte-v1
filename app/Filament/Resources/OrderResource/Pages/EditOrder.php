<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Filament\Resources\OrderResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditOrder extends EditRecord
{
    protected static string $resource = OrderResource::class;

    public function mutateFormDataBeforeFill(array $data): array
    {
        // Load related models (shipping and billing)
        $order = \App\Models\Order::with([
            'shippingAddress',
            'billingAddress',
        ])->find($data['id']);

        // dd($order);
        // Flatten related data into the form array
        if ($order?->shippingAddress) {
            $data['shipping_address'] = [
                'recipient_name' => $order->shippingAddress->recipient_name,
                'phone_number' => $order->shippingAddress->phone_number,
                'alternate_phone' => $order->shippingAddress->alternate_phone,
                'address_line_1' => $order->shippingAddress->address_line_1,
                'address_line_2' => $order->shippingAddress->address_line_2,
                'city' => $order->shippingAddress->city,
                'state' => $order->shippingAddress->state,
                'postal_code' => $order->shippingAddress->postal_code,
                'country' => $order->shippingAddress->country,
            ];
        }

        if ($order?->billingAddress) {
            $data['billing_address'] = [
                'recipient_name' => $order->billingAddress->recipient_name,
                'phone_number' => $order->billingAddress->phone_number,
                'alternate_phone' => $order->billingAddress->alternate_phone,
                'address_line_1' => $order->billingAddress->address_line_1,
                'address_line_2' => $order->billingAddress->address_line_2,
                'city' => $order->billingAddress->city,
                'state' => $order->billingAddress->state,
                'postal_code' => $order->billingAddress->postal_code,
                'country' => $order->billingAddress->country,
            ];
        }

        return $data;
    }

   protected function afterSave(): void
{
    $data = $this->form->getState();

    // Always save shipping address
    $this->record->shippingAddress()->updateOrCreate(
        ['order_id' => $this->record->id],
        $data['shipping_address']
    );

    // Handle billing address based on the is_same_billing_shipping flag
    if ($data['is_same_billing_shipping']) {
        // If they are the same, delete existing billing address if it exists
        $this->record->billingAddress()->delete();
    } else {
        // Otherwise, update or create billing address
        $this->record->billingAddress()->updateOrCreate(
            ['order_id' => $this->record->id],
            $data['billing_address']
        );
    }
}





    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
