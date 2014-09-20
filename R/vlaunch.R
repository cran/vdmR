#' Generate main window for interactive plot windows
#' 
#' \code{vlauch} generates a main window which opens each pre-generated window including statistical plot with interactivity
#' 
#' @docType methods
#' @param data data frame for default data set
#' @param name character for the name of the generated scatter plot
#' @param tag character for the common name of a series of linked plots
#' @param browse logical; if \code{TRUE}, browse the main window by the default web browser through the local web server; if \code{FALSE}, generating only
#' @export
#' @examples
#' data(vsfuk2012)
#' vscat(MarriageRate, DivorceRate, vsfuk2012, "scat1", "vsfuk2012", colour=Type)
#' vhist(FertilityRate, vsfuk2012, "hist1", "vsfuk2012", fill=Type)
#' vlaunch(vsfuk2012, "main", "vsfuk2012", browse=FALSE)
#' 

vlaunch <- function(data, name, tag, browse=TRUE){
  fn <- paste(name, ".", tag, sep="")
  basehtmlfn <- paste(".", tag, ".svg.html", sep="")
  htmlfn <- paste(name, basehtmlfn, sep="")
  fnregex <- paste("*", basehtmlfn, sep="")
  
  winlist <- paste("var winlist=['",
                   gsub(",","','",
                        paste(gsub(basehtmlfn,"",list.files(pattern=fnregex)), collapse=",")),
                   "'];\n", sep="")
    
  jspath <- file.path(system.file(package="vdmR"), "exec/vdmr_main.js")
  file.copy(jspath, paste(fn, ".js", sep=""), overwrite=TRUE)
  
  csspath <- file.path(system.file(package="vdmR"), "exec/vdmr_main.css")
  file.copy(csspath, paste(fn, ".css", sep=""), overwrite=TRUE)
  
  z <- file(paste(fn, ".html", sep=""),"w")
  cat("<html><head><title>", file=z)
  cat(fn, file=z)
  cat("</title></head>", file=z)
  
  cat("<script type=\"text/javascript\"><!--\n", file=z)
  cat(winlist, file=z)
  cat(paste("var tag='",tag,"';", sep=""), file=z)
  cat("\n//--></script>\n", file=z)
  
  cat("<script type=\"text/javascript\" src=\"", file=z)
  cat(paste(fn, ".js", sep=""), file=z)
  cat("\"></script>", file=z)
  
  cat("<link rel=\"stylesheet\" type=\"text/css\" href=\"", file=z)
  cat(paste(fn, ".css", sep=""), file=z)
  cat("\">", file=z)
  
  cat("<link rel=\"stylesheet\" type=\"text/css\" href=\"//cdn.datatables.net/1.10.0/css/jquery.dataTables.css\">", file=z)
  cat("<script type=\"text/javascript\" charset=\"utf8\" src=\"//code.jquery.com/jquery-1.10.2.min.js\"></script>", file=z)
  cat("<script type=\"text/javascript\" charset=\"utf8\" src=\"//cdn.datatables.net/1.10.0/js/jquery.dataTables.js\"></script>
", file=z)
  
  cat("<body onload=\"init();\"><div id=\"buttons\"></div><br/>", file=z)

  data.ncol <- ncol(data)
  
  cat("<table id=\"df\" class=\"display\" cellspacing=\"0\" width=\"100%\">", file=z)
  
  cat("<thead><tr>", paste(
    rep("<th>",data.ncol),
    colnames(data),
    rep("</th>",data.ncol), sep=""
  ), "</tr></thead>", sep="", file=z)
  
  cat("<tbody>", file=z)
  for(r in 1:nrow(data)){
    cat("<tr>", paste(
      rep("<td>", data.ncol),
      as.vector(t(data[r,])),
      rep("</td>", data.ncol), sep=""
    ), "</tr>", sep="", file=z)
  }
  cat("</tbody></table", file=z)
  
  cat("</body></html>", file=z)
  close(z)
  
  if(browse==TRUE){
    s <- Rook::Rhttpd$new()
    s$add(name="vdmR",
          app=Rook::Builder$new(
            Rook::Static$new(
              root=getwd(),
              urls="/"),
            Rook::Redirect$new(paste("/", fn, ".html", sep=""))))
    s$start()
    s$browse(1)
  }
  
}
