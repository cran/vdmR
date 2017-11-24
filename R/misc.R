allaes <- c("adj","alpha","angle","bg","cex", "col","color","colour","fg","fill","group",
             "hjust","label","linetype","lower","lty","lwd","max","middle","min","order",
             "pch","radius","sample","shape","size","srt","upper","vjust","weight","width",
             "x","xend","xmax","xmin","xintercept","y","yend","ymax","ymin","yintercept","z")

is.const <- function(x){
  sapply(x, function(x) "I" %in% all.names(asOneSidedFormula(x)))
}

stdaes <- c("colour", "colour", "colour", "shape", "size", "linetype", "size", "angle", "hjust",
            "fill", "color", "ymin", "ymax")

names(stdaes) <- c("col", "color", "colour", "pch", "size", "lty", "lwd", "srt", "adj",
                   "bg", "fg", "min", "max")

rename.aes <- function (x){
  full <- match(names(x), allaes)
  names(x)[!is.na(full)] <- allaes[full[!is.na(full)]]
  plyr::rename(x, stdaes, warn_missing = FALSE)
}

htmlWrapper <- function(path, svgfn){
	z <- file(paste0(path, "/", svgfn, ".html"),"w")
	cat("<object data=\"", file=z)
	cat(svgfn, file=z)
	cat("\" type=\"image/svg+xml\" ", file=z)
	cat("width=\"505px\" height=\"361px\"></object>", file=z)
	close(z)
}
