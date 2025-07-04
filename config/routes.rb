Rails.application.routes.draw do
  root 'games#show'
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Master Bingo game route
  get "masterbingo" => proc { |env| [200, {"Content-Type" => "text/html"}, [File.read(Rails.root.join("masterbingo.html"))]] }
  get "masterbingo.js" => proc { |env| [200, {"Content-Type" => "application/javascript"}, [File.read(Rails.root.join("masterbingo.js"))]] }

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
