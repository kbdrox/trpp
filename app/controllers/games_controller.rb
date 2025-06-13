class GamesController < ApplicationController
  def show
    # Get all phrases and randomly select 24 of them
    @phrases = Phrase.all.sample(24)
    
    # Add a "FREE" space in the middle (position 12)
    @phrases.insert(12, "FREE")
  end
end
