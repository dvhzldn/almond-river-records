# Project Structure

Generated on 2025-04-04T17:51:49.342Z

---

## Routes

/about → (page)
/admin/addrecord → (page)
/admin/editrecord/[id] → (page)
/admin/home → (page)
/admin → (layout)
/admin/manage-records → (page)
/admin → (page)
/api/add-record → (API route)
/api/album-of-the-week → (API route)
/api/contact → (API route)
/api/contentful/webhook → (API route)
/api/delete-record → (API route)
/api/edit-record → (API route)
/api/fulfill-order → (API route)
/api/get-record → (API route)
/api/get-records → (API route)
/api/log-event → (API route)
/api/processOrder → (API route)
/api/records → (API route)
/api/revalidate → (API route)
/api/reviews → (API route)
/api/sumup/callback → (API route)
/api/sumup/webhook → (API route)
/basket → (page)
/contact → (page)
/gift-vouchers → (page)
/help → (page)
/ → (layout)
/login → (page)
/ → (page)
/payment-success → (page)
/privacy → (page)
/record-cleaning → (page)
/records → (page)
/returns → (page)

## Components

- `AlbumOfTheWeek.tsx`: AlbumOfTheWeek
- `ClearBasketOnSuccess.tsx`: ClearBasketOnSuccess
- `ClientRecordBrowser.tsx`: ClientRecordBrowser
- `Footer.tsx`: Footer
- `GoogleReviews.tsx`: GoogleReviews
- `HomeDynamicWidgets.tsx`: HomeDynamicWidgets
- `Menu.tsx`: SiteMenu
- `Modal.tsx`: Modal
- `NewThisWeek.tsx`: NewThisWeek
- `OrderForm.tsx`: OrderForm
- `PaymentStatus.tsx`: PaymentStatus
- `PaymentSuccessClient.tsx`: PaymentSuccessClient
- `RecordStructuredData.tsx`: RecordStructuredData
- `ReturnsPolicy.tsx`: ReturnsPolicy
- `ReturnsPolicyModal.tsx`: ReturnsPolicyModal
- `SpotifyPlaylist.tsx`: SpotifyPlaylist
- `TrackList.tsx`: TrackList
- `TrackPurchaseComplete.tsx`: TrackPurchaseComplete
- `TrackPurchaseFailed.tsx`: TrackPurchaseFailed
- `TrackPurchasePending.tsx`: TrackPurchasePending
- `TrackRecordView.tsx`: TrackRecordView
- `UmamiAnalytics.tsx`: UmamiAnalytics

## Hooks

- `useAddToBasket.ts`
- `useAddToBasketWithTracking.ts`
- `useBuyNow.ts`
- `useFilteredRecords.ts`: useFilteredRecords
- `useRecords.ts`: useRecords
- `useRemoveFromBasket.ts`
- `useSupabaseOptions.ts`: useSupabaseOptions
- `useTrackCheckout.ts`: useTrackCheckout

## Utils

_No entries found._

## Lib

- `contentful.ts`: client
- `contentfulManagementClient.ts`
- `fetchAndUpdateTracklist.ts`
- `libLogAdminChange.ts`
- `logOrderEvent.ts`
- `logger.ts`
- `resendClient.ts`
- `resendContactEmail.ts`
- `runFulfillment.ts`
- `sendOrderConfirmation.ts`
- `supabaseAdmin.ts`
- `supabaseClient.ts`
- `types.ts`
- `useAnalytics.ts`: useAnalytics
- `useClientLogger.ts`
